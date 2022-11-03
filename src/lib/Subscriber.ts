import { Types as AblyTypes } from 'ably';
import {
  LocationListener,
  LocationUpdateIntervalListener,
  Resolution,
  ResolutionListener,
  StatusListener,
  SubscriberOptions,
} from '../types';
import AssetConnection from './AssetConnection';
import Logger from './utils/Logger';

class Subscriber {
  ablyOptions: AblyTypes.ClientOptions;
  onStatusUpdate?: StatusListener;
  onLocationUpdate?: LocationListener;
  onRawLocationUpdate?: LocationListener;
  onResolutionUpdate?: ResolutionListener;
  onLocationUpdateIntervalUpdate?: LocationUpdateIntervalListener;
  logger: Logger;
  assetConnection?: AssetConnection;
  resolution?: Resolution;

  constructor(options: SubscriberOptions) {
    this.logger = new Logger(options.loggerOptions);
    this.ablyOptions = options.ablyOptions;
    this.onStatusUpdate = options.onStatusUpdate;
    this.onLocationUpdate = options.onLocationUpdate;
    this.onRawLocationUpdate = options.onRawLocationUpdate;
    this.onResolutionUpdate = options.onResolutionUpdate;
    this.onLocationUpdateIntervalUpdate = options.onLocationUpdateIntervalUpdate;
    this.resolution = options.resolution;
  }

  start = async (trackingId: string): Promise<void> => {
    if (this.assetConnection) return;
    this.assetConnection = new AssetConnection(
      this.logger,
      trackingId,
      this.ablyOptions,
      this.onLocationUpdate,
      this.onRawLocationUpdate,
      this.onStatusUpdate,
      this.onResolutionUpdate,
      this.onLocationUpdateIntervalUpdate,
      this.resolution
    );
    await this.assetConnection.joinChannelPresence();
  };

  sendChangeRequest = async (resolution: Resolution): Promise<void> => {
    this.resolution = resolution;
    if (!this.assetConnection) {
      throw new Error('Cannot change resolution; no asset is currently being tracked.');
    } else {
      await this.assetConnection.performChangeResolution(resolution);
    }
  };

  stop = async (): Promise<void> => {
    await this.assetConnection?.close?.();
    delete this.assetConnection;
  };
}

export default Subscriber;
