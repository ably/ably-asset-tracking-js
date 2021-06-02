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

Visit the [Ably Asset Tracking](https://ably.com/documentation/asset-tracking) documentation for a complete API reference and code examples.

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

Here is an example of how the SDK can be used:

```ts
import { Subscriber, Accuracy } from '@ably/asset-tracking';

const ablyOptions = {
  key: ABLY_API_KEY,
  clientId: CLIENT_ID,
};

// Define a callback to be notified when a location update is recieved.
const onLocationUpdate = (locationUpdate) => {
  console.log(`Location update recieved. Coordinates: ${locationUpdate.location.geometry.coordinates}`);
};

// Define a callback to be notified when the asset online status is updated.
const onStatusUpdate = (isOnline) => {
  console.log(`Status update: Publisher is now ${isOnline ? 'online' : 'offline'}`);
};

// Request a specific resolution to be considered by the publisher.
const resolution = {
  accuracy: Accuracy.High,
  desiredInterval: 1000,
  minimumDisplacement: 1,
};

// Initialise the subscriber.
const subscriber = new Subscriber({
  ablyOptions,
  onLocationUpdate,
  onStatusUpdate,
});

const trackingId = '<some application defined asset tracking identifier>';

(async () => {
  // Start tracking an asset using its tracking identifier.
  await subscriber.start(trackingId);

  // Request a new resolution to be considered by the publisher.
  await subscriber.sendChangeRequest({
    accuracy: Accuracy.Low,
    desiredInterval: 3000,
    minimumDisplacement: 5,
  });

  // Stop tracking the asset.
  await subscriber.stop();
})();
```

## Example App

This repository also contains an example app that showcases how the Ably Asset Tracking SDK can be used:

- the [Asset Subscribing example app](examples/subscribing-example-app/)

## Development

see [Contributing](CONTRIBUTING.md).
