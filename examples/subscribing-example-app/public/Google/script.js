import { GoogleMapsMarker } from "./GoogleMapsMarker.js";
import { RiderConnection } from "../RiderConnection.js";
import { Coordinate } from "../Coordinate.js";
import { bindUi } from "../Ui.js";

const url = new URL(window.location);
const keyParam = url.searchParams.get('googleApiKey');
const apiKey = keyParam || prompt('Please enter your Google Maps API key');
url.searchParams.set('googleApiKey', apiKey);
window.history.pushState({}, '', url);

var script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=&v=weekly&callback=initMap`;
script.defer = true;

async function createMap() {
  const position = new Coordinate(0, 0);
  const mapElement = document.getElementById("map");
  const map = new google.maps.Map(mapElement, { center: position, zoom: 3 })

  function createZoomListener(cb) {
    map.addListener('zoom_changed', () => {
      cb(map.zoom);
    });
  }

  function createMarker(coordinate) {
    return new GoogleMapsMarker(map, coordinate);
  }

  const riderConnection = new RiderConnection(createMarker, createZoomListener, map.zoom);
  await riderConnection.connect(); 
  
  bindUi(riderConnection);   
};

window.initMap = createMap;

document.head.appendChild(script);
