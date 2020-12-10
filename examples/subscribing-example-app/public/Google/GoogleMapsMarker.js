import { Coordinate } from "../Coordinate.js";

export class GoogleMapsMarker {
    constructor(map, markerCoordinate) {
        this.map = map;
        this.current = markerCoordinate;
        this.lastCompassDirection = "N";
        this.marker = new google.maps.Marker({ icon: "driverN.png", map: map });
        this.map.setZoom(16);
    }

    getCurrentCoordinate() {
        return this.current;
    }

    updatePosition(targetCoordinate) {
        this.marker.setPosition(targetCoordinate);
        this.current = targetCoordinate;

        const compass = targetCoordinate.compassDirection;

        if (compass && compass !== this.lastCompassDirection) {
            this.marker.setIcon(`driver${compass}.png`);
            this.lastCompassDirection = compass;
        }
    }
    
    focus() {
        this.map.panTo(this.current);
    }
}
