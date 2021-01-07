import Ably, { Types as AblyTypes } from 'ably';
import { ClientTypes, LocationListener, Resolution, StatusListener } from '../types';
import Logger from './utils/Logger';
import { nextTick } from './utils/utils';

enum EventNames {
  raw = 'raw',
  enhanced = 'enhanced',
}

class AssetConnection {
  logger: Logger;
  ably: AblyTypes.RealtimePromise;
  channel: AblyTypes.RealtimeChannelPromise;
  trackingId: string;
  onRawLocationUpdate?: LocationListener;
  onEnhancedLocationUpdate?: LocationListener;
  onStatusUpdate?: StatusListener;
  resolution: Resolution | null;

  constructor(
    logger: Logger,
    trackingId: string,
    ablyOptions: AblyTypes.ClientOptions,
    onRawLocationUpdate?: LocationListener,
    onEnhancedLocationUpdate?: LocationListener,
    onStatusUpdate?: StatusListener,
    resolution?: Resolution
  ) {
    this.logger = logger;
    this.trackingId = trackingId;
    this.onRawLocationUpdate = onRawLocationUpdate;
    this.onEnhancedLocationUpdate = onEnhancedLocationUpdate;
    this.onStatusUpdate = onStatusUpdate;
    this.resolution = resolution ?? null;

    this.ably = new Ably.Realtime.Promise(ablyOptions);
    this.channel = this.ably.channels.get(trackingId, {
      params: { rewind: '1' },
    });

    this.joinChannelPresence();

    if (this.onRawLocationUpdate) {
      this.subscribeForRawEvents(this.onRawLocationUpdate);
    }

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
    return this.channel.presence.update({
      type: ClientTypes.publisher,
      resolution,
    });
  };

  private subscribeForRawEvents = (rawLocationListener: LocationListener) => {
    this.channel.subscribe(EventNames.raw, (message) => {
      const parsedMessage = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
      if (Array.isArray(parsedMessage)) {
        parsedMessage.forEach((msg) => nextTick(() => rawLocationListener(msg)));
      } else {
        rawLocationListener(parsedMessage);
      }
    });
  };

  private subscribeForEnhancedEvents = (enhancedLocationListener: LocationListener) => {
    this.channel.subscribe(EventNames.enhanced, (message) => {
      const parsedMessage = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
      if (Array.isArray(parsedMessage)) {
        parsedMessage.forEach((msg) => nextTick(() => enhancedLocationListener(msg)));
      } else {
        nextTick(() => enhancedLocationListener(parsedMessage));
      }
    });
  };

  private joinChannelPresence = async () => {
    this.channel.presence.subscribe(this.onPresenceMessage);
    this.channel.presence
      .enterClient(this.ably.auth.clientId, {
        type: ClientTypes.subscriber,
        resolution: this.resolution,
      })
      .catch((reason) => {
        this.logger.logError(`Error entering channel presence: ${reason}`);
        throw new Error(reason);
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
    if (data?.type === ClientTypes.publisher) {
      if (presenceMessage.action === 'enter') {
        this.notifyAssetIsOnline();
      } else if (presenceMessage.action === 'leave') {
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
