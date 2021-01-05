import { MapBoxMarker } from "./MapBoxMarker.js";
import { RiderConnection } from "../RiderConnection.js";
import { Coordinate } from "../Coordinate.js";
import { bindUi } from "../Ui.js";

const url = new URL(window.location);
const keyParam = url.searchParams.get('key');
const accessToken = keyParam || prompt('Please enter your Mapbox access token');
url.searchParams.set('key', accessToken);
window.history.pushState({}, '', url);
mapboxgl.accessToken = accessToken;

(async function createMap() {
  const position = new Coordinate(0, 0);
  const mapElement = "map";
  const map = new mapboxgl.Map({ center: position.toGeoJson(), zoom: 15, container: mapElement, style: 'mapbox://styles/mapbox/streets-v11' });

  function createMarker(coordinate) {
    return new MapBoxMarker(map, coordinate);
  };

  const riderConnection = new RiderConnection(createMarker);
  await riderConnection.connect();

  bindUi(riderConnection);    
})();
