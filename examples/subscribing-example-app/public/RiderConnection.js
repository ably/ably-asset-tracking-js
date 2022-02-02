import { Vehicle } from './Vehicle.js';
import { Coordinate } from './Coordinate.js';

const { Accuracy, Subscriber } = AblyAssetTracking;

const lowResolution = {
  accuracy: Accuracy.Balanced,
  desiredInterval: 2000, // Desired time between updates, in milliseconds.
  minimumDisplacement: 15, // Desired minimum positional granularity required, in meters.
};

const highResolution = {
  accuracy: Accuracy.Maximum,
  desiredInterval: 500,
  minimumDisplacement: 2,
};

const zoomThreshold = 14;

export class RiderConnection {
  constructor(createMapSpecificMarker, createMapSpecificZoomListener, initialZoomLevel) {
    this.createMapSpecificMarker = createMapSpecificMarker;
    this.createMapSpecificZoomListener = createMapSpecificZoomListener;
    this.hiRes = initialZoomLevel > 14;
    this.renderSkippedLocations = false;
    this.skippedLocationInterval = 500;
    this.timeouts = [];
    this.displayAccuracyCircle = true;
    this.zoomLevel = 0;

    this.subscriber = new Subscriber({
      ablyOptions: { authUrl: '/api/createTokenRequest' },
      onLocationUpdate: (message) => {
        this.processMessage(message);
      },
      onRawLocationUpdate: (message) => {
        this.processMessage(message, true);
      },
      onStatusUpdate: (status) => {
        this.statusUpdateCallback(status);
      },
      resolution: this.hiRes ? lowResolution : highResolution,
    });
    createMapSpecificZoomListener((zoom) => {
      this.zoomLevel = zoom;
      if (zoom > zoomThreshold && !this.hiRes) {
        this.hiRes = true;
        this.subscriber.sendChangeRequest(highResolution);
        this.rider?.createAccuracyCircle();
      } else if (zoom <= zoomThreshold && this.hiRes) {
        this.rider?.hideAccuracyCircle();
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

  setRenderSkippedLocations(state) {
    this.renderSkippedLocations = state;
  }

  setSkippedLocationInterval(interval) {
    this.skippedLocationInterval = interval;
  }

  processMessage(message, isRaw) {
    const locationCoordinate = Coordinate.fromMessage(message);

    const riderId = locationCoordinate.id ?? 'default-id';

    if (!this.rider) {
      const marker = this.createMapSpecificMarker(locationCoordinate);
      this.rider = new Vehicle(riderId, true, marker);

      marker.focus();
    }

    if (this.timeouts.length > 0) {
      this.timeouts.forEach(clearTimeout);
      this.timeouts = [];
    }

    if (this.renderSkippedLocations && message.skippedLocations.length) {
      const allLocations = [...message.skippedLocations, message.location];
      const interval = this.skippedLocationInterval / (allLocations.length - 1);
      allLocations.forEach((location, index) => {
        this.timeouts.push(setTimeout(() => {
          this.rider.move(Coordinate.fromLocation(location), location.properties.accuracyHorizontal, this.shouldSnap);
        }, interval * index));
      });
    } else {
      this.rider.move(locationCoordinate, message.location.properties.accuracyHorizontal, isRaw, this.shouldSnap);
    }
  }

  onStatusUpdate(callbackFunction) {
    this.statusUpdateCallback = callbackFunction;
  }

  setDisplayAccuracyCircle(displayAccuracyCircle) {
    if (this.displayAccuracyCircle && !displayAccuracyCircle) {
      this.displayAccuracyCircle = false;
      this.rider.hideAccuracyCircle();
    } else if (!this.displayAccuracyCircle && displayAccuracyCircle) {
      this.displayAccuracyCircle = true;
      if (this.zoomLevel > zoomThreshold) {
        this.rider?.createAccuracyCircle();
      }
    }
  }
}
