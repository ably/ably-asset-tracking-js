import { MapBoxMarker } from "./MapBoxMarker.js";
import { RiderConnection } from "../RiderConnection.js";
import { Coordinate } from "../Coordinate.js";
import { bindUi } from "../Ui.js";

(async function() {

  mapboxgl.accessToken = '***REMOVED***';
  
  const position = new Coordinate(0, 0);
  const mapElement = "map";
  const map = new mapboxgl.Map({ center: position.toGeoJson(), zoom: 15, container: mapElement, style: 'mapbox://styles/mapbox/streets-v11' });

  function createMarker(coordinate) {
    return new MapBoxMarker(map, coordinate);
  }

  const riderConnection = new RiderConnection(createMarker);
  await riderConnection.connect();

  bindUi(riderConnection);    
})();
