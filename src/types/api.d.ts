import * as types from '.';


/**
 * Represents a subscriber. Subscribers maintain the Ably connection, relaying location updates for a tracked item back
 * to the local application as they are received from the remote publisher.
 */
export class Subscriber {
  constructor(options: types.SubscriberOptions);

  /**
   * Start listening for location updates from an asset.
   *
   * Returns a promise which will resolve when the Ably client has entered channel presence.
   * @async
   * @param string trackingId The unique tracking identifier for the asset.
   */
  async start(trackingId: string): Promise<void>;

  /**
   * Sends the desired resolution for updates, to be requested from the remote publisher.
   *
   * Returns a promise which will resolve when the request has been successfully registered with the server,
   * however this does not necessarily mean that the request has been received and actioned by the publisher.
   * @async
   * @param resolution The resolution to request.
   */
  async sendChangeRequest(resolution: types.Resolution): Promise<void>;

  /**
   * Stops the subscriber from listening to published locations.
   * @async
   */
  async stop(): Promise<void>;

  onStatusUpdate?: types.StatusListener;
  onLocationUpdate?: types.LocationListener;
  onRawLocationUpdate?: types.LocationListener;
  onResolutionUpdate?: types.ResolutionListener;
  onLocationUpdateIntervalUpdate?: types.LocationUpdateIntervalListener;
}
