import { Coordinate } from './Coordinate.js';

export class Vehicle {

  constructor(markerWrapper) {
    this.marker = markerWrapper;
  }

  get position() {
    return this.marker.getCurrentCoordinate();
  }

  showAccuracyCircle() {
    this.marker.showAccuracyCircle();
  }

  hideAccuracyCircle() {
    this.marker.hideAccuracyCircle();
  }

  showRawLocationMarker() {
    this.marker.showRawLocationMarker();
  }

  hideRawLocationMarker() {
    this.marker.hideRawLocationMarker();
  }

  setDisplayRawLocations(value) {
    if (value) {
      this.marker.showRawLocationMarker();
    } else {
      this.marker.hideRawLocationMarker();
    }
  }

  async move(destinationPosition, isRaw) {
    const destinationCoordinate = Coordinate.fromPosition(destinationPosition);
    const accuracy = destinationPosition.accuracy;
    if (isRaw) {
      this.marker.updateRawPosition(destinationCoordinate, accuracy);
    } else {
      this.marker.updatePosition(destinationCoordinate, accuracy);
    }
  }

  focusCamera() {
    this.marker.focus();
  }
}
