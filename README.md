## Ably Asset Tracking SDK for JavaScript

![.github/workflows/check.yml](https://github.com/ably/ably-asset-tracking-js/workflows/.github/workflows/check.yml/badge.svg)

### Overview

Ably Asset Tracking SDKs provide an easy way to track multiple assets with realtime location updates powered by [Ably](https://ably.io/) realtime network.

**Status:** this is a preview version of the SDK. That means that it contains a subset of the final SDK functionality, and the APIs are subject to change.

Ably Asset Tracking is:

- **easy to integrate** - comprising two complementary SDKs with easy to use APIs, available for multiple platforms:
  - Asset Publishing SDK, for embedding in apps running on the courier's device
  - Asset Subscribing SDK, for embedding in apps runnong on the customer's observing device
- **extensible** - as Ably is used as the underlying transport, you have direct access to your data and can use Ably integrations for a wide range of applications in addition to direct realtime subscriptions - examples include:
  - passing to a 3rd party system
  - persistence for later retrieval
- **built for purpose** - the APIs and underlying functionality are designed specifically to meet the requirements of a range of common asset tracking use-cases

This repository contains the Asset Subscribing SDK for Web.

## Example App

This repository also contains an example app that showcases how the Ably Asset Tracking SDK can be used:

- the [Asset Subscribing example app](examples/subscribing-example-app/)

### Usage

```ts
import AblyAssetTracking from 'ably-asset-tracking';

const ablyOptions = {
  key: '',
  clientId: '',
};

const trackingId: '';

const onRawLocationUpdate = (geoJsonMessage) => {
  console.log(`Raw location update: ${geoJsonMessage}`);
};

const onEnhancedLocationUpdate = (geoJsonMessage) => {
  console.log(`Enhanced location update: ${geoJsonMessage}`);
};

const onStatusUpdate = (isOnline) => {
  console.log(`Status update: Publisher is now ${isOnline ? 'online' : 'offline'}`);
};

const assetSubscriber = new AblyAssetTrackingAssetSubscriber({
  ablyOptions,
  onRawLocationUpdate,
  onEnhancedLocationUpdate,
  onStatusUpdate,
});

assetSubscriber.start(trackingId);

assetSubscriber.stop();
```
