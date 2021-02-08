import { Types as AblyTypes } from 'ably';
import { LocationListener, Resolution, StatusListener, SubscriberOptions } from '../types';
import AssetConnection from './AssetConnection';
import Logger from './utils/Logger';

class AssetSubscriber {
  ablyOptions: AblyTypes.ClientOptions;
  onStatusUpdate?: StatusListener;
  onLocationUpdate?: LocationListener;
  logger: Logger;
  assetConnection?: AssetConnection;
  resolution?: Resolution;

  constructor(options: SubscriberOptions) {
    this.logger = new Logger(options.loggerOptions);
    this.ablyOptions = options.ablyOptions;
    this.onStatusUpdate = options.onStatusUpdate;
    this.onLocationUpdate = options.onLocationUpdate;
    this.resolution = options.resolution;
  }

  start = async (trackingId: string): Promise<void> => {
    this.assetConnection = new AssetConnection(
      this.logger,
      trackingId,
      this.ablyOptions,
      this.onLocationUpdate,
      this.onStatusUpdate,
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

export default AssetSubscriber;
