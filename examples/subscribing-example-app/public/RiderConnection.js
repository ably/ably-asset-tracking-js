import { Vehicle } from './Vehicle.js';
import { Coordinate } from './Coordinate.js';

const { Accuracy, AssetSubscriber } = AblyAssetTracking;

const lowResolution = {
  accuracy: Accuracy.Low,
  desiredInterval: 5000, // Desired time between updates, in milliseconds.
  minimumDisplacement: 15, // Desired minimum positional granularity required, in meters.
};

const highResolution = {
  accuracy: Accuracy.High,
  desiredInterval: 1000,
  minimumDisplacement: 5,
};

const zoomThreshold = 14;

export class RiderConnection {
  constructor(createMapSpecificMarker, createMapSpecificZoomListener, initialZoomLevel) {
    this.createMapSpecificMarker = createMapSpecificMarker;
    this.createMapSpecificZoomListener = createMapSpecificZoomListener;
    this.hiRes = initialZoomLevel > 14;
    this.assetSubscriber = new AssetSubscriber({
      ablyOptions: { authUrl: '/api/createTokenRequest' },
      onEnhancedLocationUpdate: (message) => {
        this.processMessage(message);
      },
      onStatusUpdate: (status) => {
        this.statusUpdateCallback(status);
      },
      resolution: this.hiRes ? lowResolution : highResolution,
    });
    createMapSpecificZoomListener((zoom) => {
      if (zoom > zoomThreshold && !this.hiRes) {
        this.hiRes = true;
        this.assetSubscriber.sendChangeRequest(highResolution);
      } else if (zoom <= zoomThreshold && this.hiRes) {
        this.hiRes = false;
        this.assetSubscriber.sendChangeRequest(lowResolution);
      }
    });
    this.shouldSnap = false;
  }

  async connect(channelId) {
    if (this.assetSubscriber.assetConnection) {
      await this.assetSubscriber.stop();
    }

    this.assetSubscriber.start(channelId || 'ivan');
  }

  processMessage(message) {
    const locationCoordinate = Coordinate.fromMessage(message);

    const riderId = locationCoordinate.id ?? 'default-id';

    if (!this.rider) {
      const marker = this.createMapSpecificMarker(locationCoordinate);
      this.rider = new Vehicle(riderId, true, marker);

      marker.focus();
    }

    this.rider.move(locationCoordinate, this.shouldSnap);
  }

  onStatusUpdate(callbackFunction) {
    this.statusUpdateCallback = callbackFunction;
  }
}
