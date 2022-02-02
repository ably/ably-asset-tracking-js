import { Coordinate } from "../Coordinate.js";

export class MapBoxMarker {
    constructor(map, markerCoordinate) {
        this.el = document.createElement('div');
        this.el.className = 'marker-mapbox';
        this.rawEl = document.createElement('div');
        this.rawEl.className = 'raw-marker-mapbox';

        this.map = map;
        this.marker = new mapboxgl.Marker(this.el)
            .setLngLat(markerCoordinate)
            .addTo(this.map);
        this.rawMarker = new mapboxgl.Marker(this.rawEl)
            .setLngLat(markerCoordinate)
            .addTo(this.map);
        this.accuracyCircle = new MapboxCircle(markerCoordinate, 1)
            .addTo(this.map);
    }

    createAccuracyCircle() {
        if (!this.accuracyCircle) {
            this.accuracyCircle = new MapboxCircle(this.marker.getLngLat(), 1)
                .addTo(this.map);
        }
    }

    hideAccuracyCircle() {
      this.accuracyCircle.remove();
      this.accuracyCircle = null;
    }

    getCurrentCoordinate() {
        return Coordinate.fromLngLat(this.marker.getLngLat());
    }

    updatePosition(targetCoordinate, accuracy) {
        this.marker.setLngLat(targetCoordinate);
        this.accuracyCircle?.setCenter(targetCoordinate);
        this.accuracyCircle?.setRadius(accuracy);
        this.el.setAttribute('compass-direction', targetCoordinate.compassDirection);
    }

    updateRawPosition(targetCoordinate) {
        this.rawMarker.setLngLat(targetCoordinate);
        this.rawEl.setAttribute('compass-direction', targetCoordinate.compassDirection);
    }

    focus() {
        const position = this.getCurrentCoordinate();
        this.map.flyTo({center: position, essential: true});
    }
}
