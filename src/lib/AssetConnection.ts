import Ably, { Types as AblyTypes } from 'ably';
import { LocationListener, Resolution, StatusListener } from '../types';
import { ClientTypes } from './constants';
import Logger from './utils/Logger';
import { setImmediate } from './utils/utils';

export enum EventNames {
  Raw = 'raw',
  Enhanced = 'enhanced',
}

class AssetConnection {
  logger: Logger;
  ably: AblyTypes.RealtimePromise;
  channel: AblyTypes.RealtimeChannelPromise;
  trackingId: string;
  onEnhancedLocationUpdate?: LocationListener;
  onStatusUpdate?: StatusListener;
  resolution: Resolution | null;

  constructor(
    logger: Logger,
    trackingId: string,
    ablyOptions: AblyTypes.ClientOptions,
    onEnhancedLocationUpdate?: LocationListener,
    onStatusUpdate?: StatusListener,
    resolution?: Resolution
  ) {
    this.logger = logger;
    this.trackingId = trackingId;
    this.onEnhancedLocationUpdate = onEnhancedLocationUpdate;
    this.onStatusUpdate = onStatusUpdate;
    this.resolution = resolution ?? null;

    this.ably = new Ably.Realtime.Promise(ablyOptions);
    this.channel = this.ably.channels.get(trackingId, {
      params: { rewind: '1' },
    });

    if (this.onEnhancedLocationUpdate) {
      this.subscribeForEnhancedEvents(this.onEnhancedLocationUpdate);
    }
  }

  close = async (): Promise<void> => {
    this.channel.unsubscribe();
    await this.leaveChannelPresence();
    this.ably.close();
  };

  performChangeResolution = async (resolution: Resolution): Promise<void> => {
    await this.channel.presence.update({
      type: ClientTypes.Subscriber,
      resolution,
    });
  };

  joinChannelPresence = async (): Promise<void> => {
    this.channel.presence.subscribe(this.onPresenceMessage);
    return this.channel.presence
      .enterClient(this.ably.auth.clientId, {
        type: ClientTypes.Subscriber,
        resolution: this.resolution,
      })
      .catch((reason) => {
        this.logger.logError(`Error entering channel presence: ${reason}`);
        throw new Error(reason);
      });
  };

  private subscribeForEnhancedEvents = (enhancedLocationListener: LocationListener) => {
    this.channel.subscribe(EventNames.Enhanced, (message) => {
      const parsedMessage = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
      if (Array.isArray(parsedMessage)) {
        parsedMessage.forEach((msg) => setImmediate(() => enhancedLocationListener(msg)));
      } else {
        setImmediate(() => enhancedLocationListener(parsedMessage));
      }
    });
  };

  private leaveChannelPresence = async () => {
    this.channel.presence.unsubscribe();
    this.notifyAssetIsOffline();
    try {
      await this.channel.presence.leaveClient(this.ably.auth.clientId);
    } catch (e) {
      this.logger.logError(`Error leaving channel presence: ${e.reason}`);
      throw new Error(e.reason);
    }
  };

  private onPresenceMessage = (presenceMessage: AblyTypes.PresenceMessage) => {
    const data = typeof presenceMessage.data === 'string' ? JSON.parse(presenceMessage.data) : presenceMessage.data;
    if (data?.type === ClientTypes.Publisher) {
      if (['enter', 'present'].includes(presenceMessage.action)) {
        this.notifyAssetIsOnline();
      } else if (['leave', 'absent'].includes(presenceMessage.action)) {
        this.notifyAssetIsOffline();
      }
    }
  };

  private notifyAssetIsOnline = () => {
    this?.onStatusUpdate?.(true);
  };

  private notifyAssetIsOffline = () => {
    this?.onStatusUpdate?.(false);
  };
}

export default AssetConnection;
