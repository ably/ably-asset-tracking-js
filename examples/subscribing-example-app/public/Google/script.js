import { GoogleMapsMarker } from "./GoogleMapsMarker.js";
import { RiderConnection } from "../RiderConnection.js";
import { Coordinate } from "../Coordinate.js";
import { bindUi } from "../Ui.js";

(async function() {

  const position = new Coordinate(0, 0);
  const mapElement = document.getElementById("map");
  const map = new google.maps.Map(mapElement, { center: position, zoom: 3 });

  function createMarker(coordinate) {
    return new GoogleMapsMarker(map, coordinate);
  }

  const riderConnection = new RiderConnection(createMarker);
  await riderConnection.connect(); 
  
  bindUi(riderConnection);   
})();
