import * as types from '.';

export class AssetSubscriber {
  constructor(options: types.SubscriberOptions);

  async start(trackingId: string): Promise<void>;

  async sendChangeRequest(resolution: types.Resolution): Promise<void>;

  async stop(): Promise<void>;
}
