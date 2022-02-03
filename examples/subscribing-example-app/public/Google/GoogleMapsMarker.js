import { Coordinate } from "../Coordinate.js";

export class GoogleMapsMarker {
    constructor(map, markerCoordinate) {
        this.map = map;
        this.current = markerCoordinate;
        this.lastCompassDirection = "N";
        this.marker = new google.maps.Marker({ icon: "/driverN.png", map: map });
	this.rawMarker = new google.maps.Marker({ icon: "/driverN.png", map: map, opacity: 0.3, visible: false });
        this.accuracyCircle = new google.maps.Circle({
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
          map,
          center: markerCoordinate,
          radius: 100,
        });
        this.map.setZoom(16);
    }

    showAccuracyCircle() {
      this.accuracyCircle.setVisible(true);
    }

    hideAccuracyCircle() {
      this.accuracyCircle.setVisible(false);
    }

    showRawLocationMarker() {
      this.rawMarker.setVisible(true);
    }

    hideRawLocationMarker() {
      this.rawMarker.setVisible(false);
    }

    getCurrentCoordinate() {
      return this.current;
    }

    updateRawPosition(targetCoordinate) {
      this.rawMarker.setPosition(targetCoordinate);
      const compass = targetCoordinate.compassDirection;

      if (compass && compass !== this.lastCompassDirection) {
        this.rawMarker.setIcon(`/driver${compass}.png`);
        this.lastCompassDirection = compass;
      }
    }

    updatePosition(targetCoordinate, accuracy) {
        this.marker.setPosition(targetCoordinate);
        this.accuracyCircle.setCenter(targetCoordinate);
        this.accuracyCircle.setRadius(accuracy);
        this.current = targetCoordinate;

        const compass = targetCoordinate.compassDirection;

        if (compass && compass !== this.lastCompassDirection) {
            this.marker.setIcon(`/driver${compass}.png`);
            this.lastCompassDirection = compass;
        }
    }

    focus() {
        this.map.panTo(this.current);
    }
}
