import { Vehicle } from './Vehicle.js';
import { Coordinate } from './Coordinate.js';

const { Accuracy, Subscriber, LocationAnimator } = AblyAssetTracking;

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
    this.locationUpdateInterval = this.skippedLocationInterval;
    this.timeouts = [];
    this.displayAccuracyCircle = true;
    this.zoomLevel = 0;
    this.animator = new LocationAnimator(
      (position) => { this.rider?.move(position, false); },
      () => { this.rider?.focusCamera(); }
    )
    this.rawAnimator = new LocationAnimator(
      (position) => { this.rider?.move(position, true); }
    )

    this.subscriber = new Subscriber({
      ablyOptions: { authUrl: '/api/createTokenRequest' },
    });

    createMapSpecificZoomListener((zoom) => {
      this.zoomLevel = zoom;
      if (zoom > zoomThreshold && !this.hiRes) {
        this.hiRes = true;
        this.asset?.sendChangeRequest?.(highResolution);
        this.rider?.showAccuracyCircle();
      } else if (zoom <= zoomThreshold && this.hiRes) {
        this.rider?.hideAccuracyCircle();
        this.hiRes = false;
        this.asset?.sendChangeRequest?.(lowResolution);
      }
    });
  }

  async connect(channelId) {
    if (this.asset) {
      await this.asset.stop();
    }

    this.asset = this.subscriber.get(channelId || 'ivan', this.hiRes ? lowResolution : highResolution);

    this.asset.addLocationListener((message) => {
      this.processMessage(message);
    });

    this.asset.addRawLocationListener((message) => {
      this.processMessage(message, true);
    });

    this.asset.addStatusListener((status) => {
      this.statusUpdateCallback(status);
    });

    this.asset.addLocationUpdateIntervalListener((desiredInterval) => {
      this.locationUpdateInterval = desiredInterval
    });

    await this.asset.start(channelId || 'ivan');
  }

  setRenderSkippedLocations(state) {
    this.renderSkippedLocations = state;
  }

  setSkippedLocationInterval(interval) {
    this.skippedLocationInterval = interval;
  }

  setDisplayRawLocations(value) {
    this.rider.setDisplayRawLocations(value);
  }

  setShouldSnapToLocations(value) {
    this.animator.snapToLocation = value;
    this.rawAnimator.snapToLocation = value;
  }

  processMessage(message, isRaw) {
    const locationCoordinate = Coordinate.fromMessage(message);

    if (!this.rider) {
      const marker = this.createMapSpecificMarker(locationCoordinate);
      this.rider = new Vehicle(marker);

      marker.focus();
    }

    if (isRaw) {
      this.rawAnimator.animateLocationUpdate(message, this.locationUpdateInterval)
    } else {
      this.animator.animateLocationUpdate(message, this.locationUpdateInterval)
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
        this.rider?.showAccuracyCircle();
      }
    }
  }
}
