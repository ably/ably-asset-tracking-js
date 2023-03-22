import * as Ably from 'ably';
import { Resolution, SubscriberOptions } from '../types';
import Asset from './Asset';
import Logger from './utils/Logger';
import { version } from '../../package.json';

declare module 'ably' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Types {
    export interface ClientOptions {
      agents?: Record<string, string>;
    }
  }
}

class Subscriber {
  ablyOptions: Ably.Types.ClientOptions;
  logger: Logger;
  assets: Map<string, Asset>;
  client: Ably.Types.RealtimePromise;

  constructor(options: SubscriberOptions) {
    this.logger = new Logger(options.loggerOptions);
    this.ablyOptions = options.ablyOptions;
    this.ablyOptions.agents = {
      'ably-asset-tracking-js': version,
    };
    this.assets = new Map();
    this.client = new Ably.Realtime.Promise(this.ablyOptions);
  }

  get(trackingId: string, resolution?: Resolution): Asset {
    if (this.assets.has(trackingId)) {
      return this.assets.get(trackingId) as Asset;
    }

    const asset = new Asset(this, trackingId, resolution);
    this.assets.set(trackingId, asset);
    return asset;
  }

  close(): void {
    this.client.close();
  }
}

export default Subscriber;
