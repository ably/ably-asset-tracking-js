# Ably Asset Tracking SDK for JavaScript

![.github/workflows/check.yml](https://github.com/ably/ably-asset-tracking-js/workflows/.github/workflows/check.yml/badge.svg)

## Overview

Ably Asset Tracking SDKs provide an easy way to track multiple assets with realtime location updates powered by [Ably](https://ably.com/) realtime network and Mapbox [Navigation SDK](https://docs.mapbox.com/android/navigation/overview/) with location enhancement.

**Status:** this is a preview version of the SDK. That means that it contains a subset of the final SDK functionality, and the APIs are subject to change. The latest release of this SDK is available in the [Released section](https://github.com/ably/ably-asset-tracking-js/releases) of this repository.

Ably Asset Tracking is:

- **easy to integrate** - comprising two complementary SDKs with easy to use APIs, available for multiple platforms:
  - Asset Publishing SDK, for embedding in apps running on the courier's device
  - Asset Subscribing SDK, for embedding in apps runnong on the customer's observing device
- **extensible** - as Ably is used as the underlying transport, you have direct access to your data and can use Ably integrations for a wide range of applications in addition to direct realtime subscriptions - examples include:
  - passing to a 3rd party system
  - persistence for later retrieval
- **built for purpose** - the APIs and underlying functionality are designed specifically to meet the requirements of a range of common asset tracking use-cases

This repository contains the Asset Subscribing SDK for Web.

### Documentation

Visit the [Ably Asset Tracking](https://ably.com/docs/asset-tracking) documentation for a complete API reference and code examples.

###  Useful Resources

- [Introducing Ably Asset Tracking - public beta now available](https://ably.com/blog/ably-asset-tracking-beta)
- [Accurate Delivery Tracking with Navigation SDK + Ably Realtime Network](https://www.mapbox.com/blog/accurate-delivery-tracking)

## Installation

To use Ably Asset Tracking in your app, install it as a dependency:
```bash
# If you are using NPM:
npm install @ably/asset-tracking

# If you are using Yarn:
yarn add @ably/asset-tracking
```

## Usage

### Subscribing to location updates

```ts
import { Subscriber } from '@ably/asset-tracking';

// Client options passed to the underling ably-js instance.
// You must provide some way for the client to authenticate with Ably.
// In this example we're using basic authentication which means we must also provide a clientId.
// See: https://ably.com/docs/core-features/authentication
const ablyOptions = {
  key: ABLY_API_KEY,
  clientId: CLIENT_ID,
};

// Create a Subscriber instance.
const subscriber = new Subscriber({
  ablyOptions,
});

// Get an asset.
const asset = subscriber.get('my_tracking_id');

// Define a callback to be notified when a location update is recieved.
asset.addLocationListener((locationUpdate) => {
  console.log(`Location update recieved. Coordinates: ${locationUpdate.location.geometry.coordinates}`);
});

// Start tracking the asset. This will attach to the Ably realtime channel and enter presence.
await asset.start();

// Stop tracking the asset, at some point later on when you no longer need to receive location updates.
await asset.stop();
```

### Subscribing to driver status

```ts
// Register a callback to be notified when the asset online status is updated.
asset.addStatusListener((isOnline) => {
  console.log(`Status update: Publisher is now ${isOnline ? 'online' : 'offline'}`);
});
```

### Requesting publisher resolution
```ts
import { Accuracy } from '@ably/asset-tracking';

// You can request a specific resolution to be considered by the publisher when you create an asset instance...
const resolution = {
  accuracy: Accuracy.High,
  desiredInterval: 1000,
  minimumDisplacement: 1,
};

const asset = subscriber.get('my_tracking_id', resolution);

// ...And you can send a request to change the resolution when the asset is already started
await asset.sendChangeRequest({
  accuracy: Accuracy.Low,
  desiredInterval: 3000,
  minimumDisplacement: 5,
});
```

## Example App

This repository also contains an example app that showcases how the Ably Asset Tracking SDK can be used:

- the [Asset Subscribing example app](examples/subscribing-example-app/)

## Development

see [Contributing](CONTRIBUTING.md).
