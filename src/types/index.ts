export type GeoJsonMessage = unknown;

export type LocationListener = (geoJsonMsg: GeoJsonMessage) => unknown;

export type StatusListener = (isOnline: boolean) => unknown;
