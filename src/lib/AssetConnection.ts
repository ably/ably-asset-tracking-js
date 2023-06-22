import { Types as AblyTypes } from 'ably';
import {
  LocationListener,
  LocationUpdateIntervalListener,
  Resolution,
  ResolutionListener,
  StatusListener,
} from '../types';
import { ClientTypes } from './constants';
import Subscriber from './Subscriber';
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
  resolution: Resolution | null;
  enhancedLocationListeners: Set<LocationListener>;
  rawLocationListeners: Set<LocationListener>;
  statusListeners: Set<StatusListener>;
  resolutionListeners: Set<ResolutionListener>;
  locationUpdateIntervalListeners: Set<LocationUpdateIntervalListener>;

  constructor(subscriber: Subscriber, trackingId: string, resolution?: Resolution) {
    this.logger = subscriber.logger;
    this.ably = subscriber.client;
    this.trackingId = trackingId;
    this.resolution = resolution ?? null;

    this.channel = this.ably.channels.get(`tracking:${trackingId}`, {
      params: { rewind: '1' },
    });

    this.enhancedLocationListeners = new Set();
    this.rawLocationListeners = new Set();
    this.statusListeners = new Set();
    this.resolutionListeners = new Set();
    this.locationUpdateIntervalListeners = new Set();
  }

  async start(): Promise<void> {
    await this.subscribeForEnhancedEvents();

    await this.subscribeForRawEvents();

    await this.joinChannelPresence();
  }

  async close(): Promise<void> {
    this.channel.unsubscribe();
    this.ably.channels.release(this.trackingId);
    await this.leaveChannelPresence();
  }

  async performChangeResolution(resolution: Resolution): Promise<void> {
    await this.channel.presence.update({
      type: ClientTypes.Subscriber,
      resolution,
    });
  }

  async joinChannelPresence(): Promise<void> {
    this.channel.presence.subscribe((msg) => {
      this.onPresenceMessage(msg);
    });

    return this.channel.presence
      .enterClient(this.ably.auth.clientId, {
        type: ClientTypes.Subscriber,
        resolution: this.resolution,
      })
      .catch((error) => {
        this.logger.logError(`Error entering channel presence: ${(error as AblyTypes.ErrorInfo).message}`);
        throw error;
      });
  }

  private subscribeForRawEvents() {
    this.channel.subscribe(EventNames.Raw, (message) => {
      const parsedMessage = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
      if (Array.isArray(parsedMessage)) {
        parsedMessage.forEach((msg) =>
          setImmediate(() => {
            this.rawLocationListeners.forEach((listener) => {
              listener(msg);
            });
          })
        );
      } else {
        setImmediate(() => {
          this.rawLocationListeners.forEach((listener) => {
            listener(parsedMessage);
          });
        });
      }
    });
  }

  private subscribeForEnhancedEvents() {
    this.channel.subscribe(EventNames.Enhanced, (message) => {
      const parsedMessage = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
      if (Array.isArray(parsedMessage)) {
        parsedMessage.forEach((msg) =>
          setImmediate(() => {
            this.enhancedLocationListeners.forEach((listener) => {
              listener(msg);
            });
          })
        );
      } else {
        setImmediate(() => {
          this.enhancedLocationListeners.forEach((listener) => {
            listener(parsedMessage);
          });
        });
      }
    });
  }

  private async leaveChannelPresence() {
    this.channel.presence.unsubscribe();
    try {
      await this.channel.presence.leaveClient(this.ably.auth.clientId);
    } catch (error) {
      this.logger.logError(`Error leaving channel presence: ${(error as AblyTypes.ErrorInfo).message}`);
      throw error;
    }
  }

  private onPresenceMessage(presenceMessage: AblyTypes.PresenceMessage) {
    const data = typeof presenceMessage.data === 'string' ? JSON.parse(presenceMessage.data) : presenceMessage.data;
    if (data?.type === ClientTypes.Publisher) {
      if (['enter', 'present'].includes(presenceMessage.action)) {
        this.notifyAssetIsOnline();
        if (data.resolution) {
          this.updatePublisherResolutionInformation(data.resolution);
        }
      } else if (['leave', 'absent'].includes(presenceMessage.action)) {
        this.notifyAssetIsOffline();
      } else if ('update' === presenceMessage.action) {
        if (data.resolution) {
          this.updatePublisherResolutionInformation(data.resolution);
        }
      }
    }
  }

  private updatePublisherResolutionInformation(resolution: Resolution) {
    this.resolutionListeners.forEach((listener) => {
      listener(resolution);
    });
    this.locationUpdateIntervalListeners.forEach((listener) => {
      listener(resolution.desiredInterval);
    });
  }

  private notifyAssetIsOnline() {
    this.statusListeners.forEach((listener) => {
      listener(true);
    });
  }

  private notifyAssetIsOffline() {
    this.statusListeners.forEach((listener) => {
      listener(false);
    });
  }
}

export default AssetConnection;
