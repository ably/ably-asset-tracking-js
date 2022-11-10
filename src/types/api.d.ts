import * as types from '.';

/**
 * Represents a subscriber. Subscribers maintain the Ably connection, relaying location updates for a tracked item back
 * to the local application as they are received from the remote publisher.
 */
export class Subscriber {
  constructor(options: types.SubscriberOptions);

  /**
   * Start listening for location updates from the asset.
   *
   * @param string trackingId The unique tracking identifier for the asset.
   * @param Resolution resolution The desired resolution of updates, to be requested from the remote publisher.
   */
  get(trackingId: string, resolution?: types.Resolution): Asset;

  /**
   * Close the Ably connection and stop tracking all assets.
   */
  close(): void;
}

export class Asset {
  /**
   * Start listening for location updates from the asset.
   *
   * @async
   * @returns A promise which will resolve when the Ably client has entered channel presence.
   */
  async start(): Promise<void>;

  /**
   * Stops the subscriber from listening to published locations from this asset.
   * @async
   */
  async stop(): Promise<void>;

  /**
   * Register a callback to be notified when an enhanced location update is available.
   */
  addLocationListener(listener: types.LocationListener): Promise<void>;

  /**
   * Register a callback to be notified when a raw location update is available.
   */
  addRawLocationListener(listener: types.LocationListener): Promise<void>;

  /**
   * Register a callback to be notified when the online status of the asset changes.
   */
  addStatusListener(listener: types.StatusListener): Promise<void>;

  /**
   * Register a callback to be notified when the publisher's calculated resolution of the asset changes.
   */
  addResolutionListener(listener: types.StatusListener): Promise<void>;

  /**
   * Register a callback to be notified when the interval between location updates of the asset changes.
   */
  addLocationUpdateIntervalListener(listener: types.LocationUpdateIntervalListener): Promise<void>;

  /**
   * Unregister a callback to be notified when an enhanced location update is available.
   */
  removeLocationListener(listener: types.LocationListener): void;

  /**
   * Unregister a callback to be notified when a raw location update is available.
   */
  removeRawLocationListener(listener: types.LocationListener): void;

  /**
   * Unregister a callback to be notified when the online status of the asset changes.
   */
  removeStatusListener(listener: types.StatusListener): void;

  /**
   * Unregister a callback to be notified when the publisher's calculated resolution of the asset changes.
   */
  removeResolutionListener(listener: types.StatusListener): void;

  /**
   * Unregister a callback to be notified when the interval between location updates of the asset changes.
   */
  removeLocationUpdateIntervalListener(listener: types.LocationUpdateIntervalListener): void;

  /**
   * Sends the desired resolution for updates, to be requested from the remote publisher.
   *
   * Returns a promise which will resolve when the request has been successfully registered with the server,
   * however this does not necessarily mean that the request has been received and actioned by the publisher.
   * @async
   * @param resolution The resolution to request.
   */
  async sendChangeRequest(resolution: types.Resolution): Promise<void>;
}
