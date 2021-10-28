import { Vehicle } from './Vehicle.js';
import { Coordinate } from './Coordinate.js';

const { Accuracy, Subscriber } = AblyAssetTracking;

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
    this.subscriber = new Subscriber({
      ablyOptions: { authUrl: '/api/createTokenRequest' },
      onLocationUpdate: (message) => {
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
        this.subscriber.sendChangeRequest(highResolution);
      } else if (zoom <= zoomThreshold && this.hiRes) {
        this.hiRes = false;
        this.subscriber.sendChangeRequest(lowResolution);
      }
    });
    this.shouldSnap = false;
  }

  async connect(channelId) {
    if (this.subscriber.assetConnection) {
      await this.subscriber.stop();
    }

    this.subscriber.start(channelId || 'ivan');
  }

  processMessage(message) {
    const locationCoordinate = Coordinate.fromMessage(message);

    const riderId = locationCoordinate.id ?? 'default-id';

    if (!this.rider) {
      const marker = this.createMapSpecificMarker(locationCoordinate);
      this.rider = new Vehicle(riderId, true, marker);

      marker.focus();
    }

    if (message.skippedLocations.length) {
      const allLocations = [...message.skippedLocations, message.location];
      const interval = 500 / allLocations.length;
      allLocations.forEach((location, index) => {
        setTimeout(() => {
          this.rider.move(Coordinate.fromLocation(location), this.shouldSnap);
        }, interval * (index + 1));
      });
    } else {
      this.rider.move(locationCoordinate, this.shouldSnap);
    }
  }

  onStatusUpdate(callbackFunction) {
    this.statusUpdateCallback = callbackFunction;
  }
}
