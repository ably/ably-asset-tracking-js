import { Vehicle } from './Vehicle.js';
import { Coordinate } from './Coordinate.js';

export class RiderConnection {
  constructor(createMapSpecificMarker) {
    this.createMapSpecificMarker = createMapSpecificMarker;
    this.assetSubscriber = new AblyAssetTracking.AssetSubscriber({
      ablyOptions: { authUrl: '/api/createTokenRequest' },
      onEnhancedLocationUpdate: (message) => {
        this.processMessage(message);
      },
      onStatusUpdate: (status) => {
        this.statusUpdateCallback(status);
      },
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
