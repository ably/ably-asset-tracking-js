import { Coordinate } from "./Coordinate.js";

export class Vehicle {

    constructor(id, follow, markerWrapper) {
        this.id = id;
        this.follow = follow || false;

        this.marker = markerWrapper;

        this.moveBuffer = [];
        this.animationRateMs = 33;
        this.animate();

        this.movementsSinceLastFocused = 0;
        this.numberOfMovementsToFocusAfter = 100;
    }

    get position() {
        return this.marker.getCurrentCoordinate();
    }

    createAccuracyCircle() {
      this.marker.createAccuracyCircle();
    }

    hideAccuracyCircle() {
      this.marker.hideAccuracyCircle();
    }

    async move(destinationCoordinate, accuracy, isRaw, snapToLocation = false) {
        this.movementsSinceLastFocused++;

        if (snapToLocation) {
            this.moveBuffer = [ destinationCoordinate ];
            return;
        }

        this.moveBuffer = [];

        const currentCoordinate = this.marker.getCurrentCoordinate();

        var path = turf.lineString([ currentCoordinate.toGeoJson(), destinationCoordinate.toGeoJson() ]);
        var pathLength = turf.length(path, { units: 'miles' });

        var numSteps = 60; // This is the FPS

        for (let step = 0; step <= numSteps; step++) {
            const curDistance = step / numSteps * pathLength;
            const targetLocation = turf.along(path, curDistance, { units: "miles" });

            const targetCoordinate = Coordinate.fromGeoJson(targetLocation.geometry.coordinates, destinationCoordinate.bearing);

            this.moveBuffer.push({ targetCoordinate, accuracy, isRaw });
        }
    }

    async animate() {
        if (this.moveBuffer.length === 0) {
            window.requestAnimationFrame(() => { this.animate(); });
            return;
        }

        const { targetCoordinate, accuracy, isRaw } = this.moveBuffer.shift();

        if (isRaw) {
            this.marker.updateRawPosition(targetCoordinate, accuracy);
        } else {
            this.marker.updatePosition(targetCoordinate, accuracy);

            if (this.movementsSinceLastFocused >= this.numberOfMovementsToFocusAfter) {
                this.movementsSinceLastFocused = 0;
                this.marker.focus();
            }
        }

        window.requestAnimationFrame(() => { this.animate(); });
    }
}
