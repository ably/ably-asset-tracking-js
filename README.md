### Usage

```ts
import { AssetSubscriber } from 'ably-asset-tracking';

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

const assetSubscriber = new AssetSubscriber({
  ablyOptions,
  trackingId,
  onRawLocationUpdate,
  onEnhancedLocationUpdate,
  onStatusUpdate,
});
```
