import {
  LocationListener,
  LocationUpdateIntervalListener,
  Resolution,
  ResolutionListener,
  StatusListener,
} from '../types';
import AssetConnection from './AssetConnection';
import Subscriber from './Subscriber';

type AssetState = 'initialized' | 'started' | 'stopped';

class Asset {
  trackingId: string;
  assetConnection: AssetConnection;
  resolution?: Resolution;
  state: AssetState;

  constructor(subscriber: Subscriber, trackingId: string, resolution?: Resolution) {
    this.trackingId = trackingId;
    this.resolution = resolution;
    this.assetConnection = new AssetConnection(subscriber, trackingId, resolution);
    this.state = 'initialized';
  }

  async start(): Promise<void> {
    if (this.state === 'started') {
      return;
    }
    await this.assetConnection.start();
    this.state = 'started';
  }

  async stop(): Promise<void> {
    if (this.state !== 'started') {
      return;
    }
    await this.assetConnection.close();
    this.state = 'stopped';
  }

  addLocationListener(listener: LocationListener): void {
    this.assetConnection.enhancedLocationListeners.add(listener);
  }

  addRawLocationListener(listener: LocationListener): void {
    this.assetConnection.rawLocationListeners.add(listener);
  }

  addStatusListener(listener: StatusListener): void {
    this.assetConnection.statusListeners.add(listener);
  }

  addResolutionListener(listener: ResolutionListener): void {
    this.assetConnection.resolutionListeners.add(listener);
  }

  addLocationUpdateIntervalListener(listener: LocationUpdateIntervalListener): void {
    this.assetConnection.locationUpdateIntervalListeners.add(listener);
  }

  removeLocationListener(listener: LocationListener): void {
    this.assetConnection.enhancedLocationListeners.delete(listener);
  }

  removeRawLocationListener(listener: LocationListener): void {
    this.assetConnection.rawLocationListeners.delete(listener);
  }

  removeStatusListener(listener: StatusListener): void {
    this.assetConnection.statusListeners.delete(listener);
  }

  removeResolutionListener(listener: ResolutionListener): void {
    this.assetConnection.resolutionListeners.delete(listener);
  }

  removeLocationUpdateIntervalListener(listener: LocationUpdateIntervalListener): void {
    this.assetConnection.locationUpdateIntervalListeners.delete(listener);
  }

  async sendChangeRequest(resolution: Resolution): Promise<void> {
    this.resolution = resolution;
    if (this.state !== 'started') {
      throw new Error('Cannot change resolution; asset is not currently being tracked.');
    } else {
      await this.assetConnection.performChangeResolution(resolution);
    }
  }
}

export default Asset;
