# Ably JavaScript Map Demo

This is a demo of using an Ably data stream to place an animating marker on a map in real time. It shows usage of both [Mapbox](https://www.mapbox.com/) and [Google maps](https://developers.google.com/maps/documentation/javascript/overview)

## To run locally

First configure `TokenRequests` by creating an `.env` file in the root of the web folder and add your [Ably API key](https://support.ably.com/a/solutions/articles/3000030502) as below:

```bash
ABLY_API_KEY=yourably:apikeyhere
```

If you are running the app for the first time, then install the dependencies, in the web folder run:
```bash
npm install
```

Also you will need to make sure you build the SDK before you can run the demo app, in the **root directory** of this repository run:
```bash
npm install
npm run build
```

Then to run the web demos, in the example app folder run:

```bash
npm run start
```

## The Web App

This is an Express app which serves an index page, and /mapbox and /google routes for the Mapbox and Google maps demos respectively.

Each of these routes, maps to a HTML file in `/views/` - [google.html](views/google.html) and [mapbox.html](views/mapbox.html) respectively.
These two examples are useful for comparing and contrasting the different SDK calls required to use either mapping solution.

### Application Topology

We've split up the files required into the following locations:

**/web/views/** - HTML files  
**/web/public/** - client side assets  
**/web/public/Google** - Google maps implementation  
**/web/public/MapBox** - MapBox maps implementation

Each HTML file references its own [JavaScript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) that executes when the page loads. This example uses ES Modules to reference the other scripts using `import` statements, without having to use a bundler, or Webpack, or any other build tools.

The Mapbox and Google Maps `script.js` modules are very similar, and do the following:

* If the URL does not already contain an API key for the relevant map provider prompts the user using `window.prompt` to enter their own.
* Instantiates the Mapbox/Google Maps SDK.
* Create an initial location to draw the world map at.
* Find an HTML element to display the map in.
* Create an instance of the respective mapping SDk.
* Implement a factory function which is responsible for creating a map marker (in a format that the active mapping SDK understands).
* Implements functions to add listeners to zoom in/out events on the given map.
* Create an instance of a class called RiderConnection, and connects to it.
* Wires up the UI.

For example, here is the Google `script.js`:

```js
(async function() {
  const position = new Coordinate(0, 0); // Create start location
  const mapElement = document.getElementById("map"); // Find mapping element
  const map = new google.maps.Map(mapElement, { center: position, zoom: 3 }); // Initilise GMaps SDK

  // Create function that RiderConnection will use to increase resolution when a user zooms in to the map
  function createZoomListener(cb) {
    map.addListener('zoom_changed', () => {
      cb(map.zoom);
    });
  }

  // Create `createMarker` factory function that creates Google Maps Marker
  function createMarker(coordinate) {
    return new GoogleMapsMarker(map, coordinate);
  }

  // Connect to Ably using our `RiderConnection` class
  const riderConnection = new RiderConnection(createMarker, createZoomListener, map.zoom);
  await riderConnection.connect();
  
  // Wire up UI buttons
  bindUi(riderConnection);
})();
```

and the very similar MapBox `script.js`:

```js

(async function() {
  const position = new Coordinate(0, 0);
  const mapElement = "map";
  const map = new mapboxgl.Map({ center: position.toGeoJson(), zoom: 15, container: mapElement, style: 'mapbox://styles/mapbox/streets-v11' });

  function createZoomListener(cb) {
    map.on('zoom', () => {
      cb(map.getZoom());
    })
  };

  function createMarker(coordinate) {
    return new MapBoxMarker(map, coordinate);
  }

  const riderConnection = new RiderConnection(createMarker, createZoomListener, map.getZoom());
  await riderConnection.connect();

  bindUi(riderConnection);
})();
```

The only places that these two code samples differ, are the `createMarker` factory functions (which create either a `GoogleMapsMarker` or a `MapBoxMarker`), the implementation of `createZoomListener`, and where we call either `google.maps.Map` or `mapboxgl.Map` to construct the map.

The logic that deals with creating and managing map markers differs between each platform, it is provider specific, so there are two completely distinct implementations in [public/Google/GoogleMapsMarker.js](public/Google/GoogleMapsMarker.js) and [public/MapBox/MapBoxMarker.js](public/Google/GoogleMapsMarker.js).

These map markers act as [`adapters`](https://en.wikipedia.org/wiki/Adapter_pattern) - the rest of the code can interacts with the map markers in a map-platform-agnostic manner.

This approach keeps the display logic out of the Ably code.

### Map Markers

Each of the PROVIDERMapMarker.js classes, implements the same set of functions:

```js
export class FooMapsMarker {
    getCurrentCoordinate() { ... }
    updatePosition(targetCoordinate) { ... }
    focus() { ... }
}
```

These functions will be called by `RiderConnection` to get current marker locations, update marker positions, and focus on markers. By keeping the factory functions in the provider specific `script.js` files, the `RiderConnection` code doesn't need to know anything about our mapping libraries.

### RiderConnection

The RiderConnection class is the heart of the application - it connects to the Ably channel dedicated to Rider GPS coordinate updates, and processes the messages as they arrive.
An instance of this class is constructed in `script.js` and handles most of the application logic.

This class has to:

* Connect to Ably using the Ably Asset Subscriber SDK.
* Processes messages from Ably.
* Create an instance of a `Vehicle` whenever a rider is detected.
* Track whether the driver is online or not.
* Change the requested resolution to an appropriate level depending on how far the user has zoomed in to the map.

#### RiderConnection implementation

The constructor is defined in [script.js](public/RiderConnection.js):

```js
export class RiderConnection {
  constructor(createMapSpecificMarker, createMapSpecificZoomListener, initialZoomLevel) {
    this.createMapSpecificMarker = createMapSpecificMarker;
    this.createMapSpecificZoomListener = createMapSpecificZoomListener;
    this.hiRes = initialZoomLevel > 14;
    this.subscriber = new Subscriber({
      ablyOptions: { authUrl: '/api/createTokenRequest' },
      onEnhancedLocationUpdate: (message) => {
        this.processMessage(message);
      },
      onStatusUpdate: (status) => {
        this.statusUpdateCallback(status);
      },
      resolution: this.hiRes ? lowResolution : highResolution,
    });
    createMapSpecificZoomListener((zoom) => {
      if (zoom > zoomThreshold && !this.hiRes) {
        this.hiRes = true;
        this.subscriber.sendChangeRequest(highResolution);
      } else if (zoom <= zoomThreshold && this.hiRes) {
        this.hiRes = false;
        this.subscriber.sendChangeRequest(lowResolution);
      }
    });
    this.shouldSnap = false;
  }
```

This constructor takes a three parameters:
 - the `createMapSpecificMarker` function - that is defined as `createMarker` in the `script.js` file - and sets up some defaults.
 - the `createMapSpecificZoomListener` function - which is defined as `createZoomListener` in the `script.js` file.
 - the initial zoom level of the map.

Callbacks are provided to the Ably Subscriber constructor to define behaviour for when the drivers status and location are updated.

In order to connect to Ably, a `connect` function is defined inside the `script.js` file:

```js
  async connect(channelId) {
    // First, make sure that if we're already connected to a driver we disconnect from it

    if (this.subscriber.assetConnection) {
      await this.subscriber.stop();
    }

    // Now, use the Asset Tracking SDK to connect to the channelId provided in the call to connect
    // This defaults to 'ivan', one of our test channel names.
    this.subscriber.start(channelId || 'ivan');
  }
```

As its name would suggest, `processMessage` processes incoming messages.

```js
  processMessage(message) {
    const locationCoordinate = Coordinate.fromMessage(message);

    // The code expects that the incoming message contains a `riderId` in order to do so -`default-id` is used if that property is not found on the inbound message (for the sake of this demo).
    const riderId = locationCoordinate.id ?? 'default-id';

    // When a rider is first detected, a (provider specific) instance of the map marker is created, by calling the factory function provided to the constructor, and is given the coordinates from the message. Then a new instance of the `Vehicle` class is created:
    if (!this.rider) {
      const marker = this.createMapSpecificMarker(locationCoordinate);
      this.rider = new Vehicle(riderId, true, marker);
      
      marker.focus();
    }

    // The `rider.move` function on the `Vehicle` instance will handle all of the animation and movement of riders across the map UI.
    this.rider.move(locationCoordinate, this.shouldSnap);
  }
```

Next, the `onStatusUpdate()` function is defined at the bottom of the `Vehicle.js` class.

#### onStatusUpdate

Finally `onViewerCountUpdated()` is a function provided to allow the `script.js` module to subscribe to the event raised when the Asset Tracking SDK notifies that the asset status has changed:

```js
  onStatusUpdate(callbackFunction) {
    this.statusUpdateCallback = callbackFunction;
  }
```

`RiderConnection` subscribes to, and manages the state of the application. While it calls `rider.move()` every time a new location is detected, it doesn't actually have any code for creating, moving or animating map markers. All of that logic lives inside the `Vehicle.js` class.

### Vehicle.js - the animation manager

Vehicle.js looks like this:

```js
export class Vehicle {
    get position() { ... }
    async move(destinationCoordinate, snapToLocation = false) { ...  }
    async animate() { ... }  
}
```

and is responsible for encapsulating the map marker animations. It uses turf.js to plot a course between its current position and a destination location each time `move()` is called, and most of its work is done inside the animate function. When a `Vehicle` is created, its constructor calls a function called `animate()`.

The `animate()` function uses the browser's [requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) API to repeatedly call itself, based on the refresh rate of your browser and your display.

```js
async animate() {
    if (this.moveBuffer.length === 0) {
        window.requestAnimationFrame(() => { this.animate(); });
        return;
    }

    const targetCoordinate = this.moveBuffer.shift();
    this.marker.updatePosition(targetCoordinate);

    if (this.movementsSinceLastFocused >= this.numberOfMovementsToFocusAfter) {
        this.movementsSinceLastFocused = 0;
        this.marker.focus();
    }

    window.requestAnimationFrame(() => { this.animate(); });
}  
```

It does a few things:

* It reads data from the `this.moveBuffer`.
* If there's a location in the moveBuffer, it calls `this.marker.updatePosition()` with the target location as a parameter.
* If the number of calls to animate is greater than or equal to the `this.numberOfMovementsToFocusAfter` - a configuration setting that defaults to 100, it pans the map center to the current vehicle location (and then resets `this.movementsSinceLastFocused` to zero).

The marker adapters are responsible for actually updating the position of the marker on the users screen - for example, the `GoogleMapsMarker` does this:

```js
updatePosition(targetCoordinate) {
    this.marker.setPosition(targetCoordinate);
    this.current = targetCoordinate;
    ...
}
```

using the `Google Maps SDK` `setPosition` function to move the marker, while the `MapBoxMarker` does this:

```js
updatePosition(targetCoordinate) {
    this.marker.setLngLat(targetCoordinate);
    this.el.setAttribute('compass-direction', targetCoordinate.compassDirection);
}
```

using the `MapBox SDK` `setLngLat()` function to move the marker.

This animation loop runs over and over, processing any movements that are in the internal `this.moveBuffer` array. If the array is empty, it does nothing.

In order to animate the marker, the `this.moveBuffer` needs to be filled with coordinates to move between, this is done in the implementation of the `move()` function.

First, to support the "animation on/off" setting in the UI, there is a `snapToLocation` check at the start of the move function. If `snapToLocation` is enabled, then `this.moveBuffer` is replaced with the final destination of the marker, and the rest of the animation logic is skipped.
This will "jump" the map marker to that location as soon as the `animate()` function is next called.

```js
async move(destinationCoordinate, snapToLocation = false) {
    this.movementsSinceLastFocused++;

    if (snapToLocation) {
        this.moveBuffer = [ destinationCoordinate ];
        return;
    }
```

If the marker needs to animate, the `this.moveBuffer` is reset, and then the current starting location is retrieved from the `this.marker` instance. The Google/MapBox Marker classes will make sure that this marker is returned in a format that the animation logic expects - the start position is then stored in a variable called `currentCoordinate`.

```js
    this.moveBuffer = [];
    const currentCoordinate = this.marker.getCurrentCoordinate();
```

Next, using [turf.js](https://turfjs.org/), a path is calculated between `currentCoordinate` and the `destinationCoordinate` that was passed as an argument to `move()` when a message was received by the `Ably channel`.

```js
    var path = turf.lineString([ currentCoordinate.toGeoJson(), destinationCoordinate.toGeoJson() ]);
    var pathLength = turf.length(path, { units: 'miles' });
```

This line is then split into 30 steps, each one of these steps representing a single movement in the animation.

Each computed step is added to the `this.moveBuffer`.

```js
    var numSteps = 30; // This is the FPS

    for (let step = 0; step <= numSteps; step++) {
        const curDistance = step / numSteps * pathLength;
        const targetLocation = turf.along(path, curDistance, { units: "miles" });

        const targetCoordinate = Coordinate.fromGeoJson(targetLocation.geometry.coordinates, destinationCoordinate.bearing);

        this.moveBuffer.push(targetCoordinate);
    }
}
```

The result is that every time the `animate()` function gets called (which on most monitors will be either every 16ms or 33ms), the marker will move the next step down the line.

### Notes: Create token request / authentication with Ably

In order to keep this demo as close to a real world application as possible,it uses Ably `tokenAuthentication` to handle the `Ably API key`. This works by providing the client side `Ably SDK` with a url that it can call to get a valid access token.

In `RiderConnection.js` there's a line that looks like this:

```js
this.ably = new Ably.Realtime.Promise({ authUrl: "/api/createTokenRequest" });
```

The url "/api/createTokenRequest" - calls a route mapped in the `Express` app found in `/web/server.js`

```js
const Ably = require('ably/promises');
require('dotenv').config();

const client = new Ably.Realtime(process.env.ABLY_API_KEY);

app.get("/api/createTokenRequest", async (request, response) => {
    const tokenRequestData = await client.auth.createTokenRequest({
        clientId: 'ably-client-side-api-calls-demo'
    });
    response.send(tokenRequestData);
});
```

This block of code reads an API key stored in a `.env` file called `ABLY_API_KEY`, which creates an instance of the Ably SDK on the server side, and uses it to send a token to the frontend that can be used without leaking the Ably credentials to anyone with a browser.

This is the recommended way to handle your Ably API key security in real-world applications.

[You can read more about this in the docs](https://www.ably.io/documentation/realtime/authentication#token-authentication).

### Notes: Dealing With Coordinates

Inside `Coordinates.js` there is a surprisingly large amount of code which formats different JavaScript objects.

This is because each of the libraries used in this sample - MapBox, GoogleMaps, and turf.js, along with the Ably messages - have a subtly different way of expressing "a latitude and longitude". Sometimes they use "lat", sometimes "latitude", or "long" and "lon", or even as a two value array of [lng,lat].

`Coordinate.js` deals with the differences in these formats, converting between them without peppering the code with code copying and renaming properties.

There are calls to these functions throughout the code - converting coordinates and bearings from one direction to another.

```js
export class Coordinate {
  get latitude() { ... }
  get longitude() { ... }
  get compassDirection() { ... }
  toGeoJson() { ... }
  static fromGeoJson(coords, bearing = 0) { ... }
  static fromLngLat(lngLatObj, bearing = 0) { ... }
  static fromMessage(messageData) { ... }
  static bearingToCompass(bearing) { ... }
}
```

### Notes: Binding to the UI in Ui.js

`Ui.js` is called from both of the `script.js` files - this is the code that handles wiring up changes to the values of the animation toggle switch (which is implemented with an HTML checkbox), and handling the button press to change rider channels when a channel name is typed into the HTML text input. 

In a larger application, the UI would probably be taken care of by a UI framework like React or Vue. In order to keep this demo legible and simple,the click handlers are bound by hand using `getElementById`, and have some code in `Ui.js` to update the "Driver is online/offline" message on the screen.

```js
export function bindUi(riderConnectionInstance) {

    var queryParams = new URLSearchParams(window.location.search);

    const channelIdTextBox = document.getElementById("channelID");
    const animationCheckbox = document.getElementById("animation");
    const subscriberCount = document.getElementById("subscriberCount");
    
    if (!channelIdTextBox) {
        throw new Error("Where has the UI gone? Cannot continue. Can't find ChannelID");
    }

    animationCheckbox.addEventListener("change", (cbEvent) => {
        riderConnectionInstance.shouldSnap = !cbEvent.target.checked;
    });

    if (queryParams.has("channel")) {
        const channelId = queryParams.get("channel");
        channelIdTextBox.value = channelId;
        riderConnectionInstance.connect(channelId);
    }

    riderConnectionInstance.onStatusUpdate((status) => { updateDriverStatus(status); });
    updateDriverStatus(riderConnectionInstance.driverStatus);
}


function updateDriverStatus(status) {
    const driverPresent = "Driver is online";
    const noDrivers = "Driver is offline";

    const message = status ? driverPresent : noDrivers;
    subscriberCount.innerHTML = message;
}

```
