import { Coordinate } from "../Coordinate.js";

export class MapBoxMarker {
    constructor(map, markerCoordinate) {
        this.el = document.createElement('div');
        this.el.className = 'marker-mapbox';

        this.map = map;
        this.marker = new mapboxgl.Marker(this.el)
            .setLngLat(markerCoordinate)
            .addTo(this.map);
    }

    getCurrentCoordinate() {
        return Coordinate.fromLngLat(this.marker.getLngLat());
    }

    updatePosition(targetCoordinate) {
        this.marker.setLngLat(targetCoordinate);
        this.el.setAttribute('compass-direction', targetCoordinate.compassDirection);
    }

    focus() {
        const position = this.getCurrentCoordinate();
        this.map.flyTo({center: position, essential: true});
    }
}