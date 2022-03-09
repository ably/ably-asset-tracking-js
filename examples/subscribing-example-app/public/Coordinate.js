export class Coordinate {
  constructor(lat, lng, bearing = 0) {
    this.lat = lat;
    this.lng = lng;
    this.bearing = bearing;
  }

  get latitude() {
    return this.lat;
  }

  get longitude() {
    return this.lng;
  }

  get compassDirection() {
      return Coordinate.bearingToCompass(this.bearing);
  }

  toGeoJson() {
    return [this.lng, this.lat];
  }

  static fromGeoJson(coords, bearing = 0) {
    return new Coordinate(coords[1], coords[0], bearing);
  }

  static fromLngLat(lngLatObj, bearing = 0) {
    return new Coordinate(lngLatObj.lat, lngLatObj.lng, bearing);
  }

  static fromMessage(messageData) {
    return Coordinate.fromLocation(messageData.location);
  }

  static fromLocation(location) {
    return Coordinate.fromGeoJson(location.geometry.coordinates, location.properties.bearing);
  }

  static fromPosition(position) {
    return new Coordinate(position.latitude, position.longitude, position.bearing);
  }

  static bearingToCompass(bearing) {
      if ((bearing >= 0 && bearing < 23) || (bearing >= 337 && bearing <= 360)) {
          return "N";
      }
      if (bearing >= 23 && bearing < 67) {
          return "NE";
      }
      if (bearing >= 67 && bearing < 113) {
          return "E";
      }
      if (bearing >= 113 && bearing < 158) {
        return "SE";
      }
      if ((bearing >= 158 && bearing < 203) ) {
          return "S";
      }
      if ((bearing >= 203 && bearing < 247) ) {
          return "SW";
      }
      if (bearing >= 247 && bearing < 292) {
          return "W";
      }        
      if (bearing >= 292 && bearing < 337) {
          return "NW";
      }

      return null;
  }
}
