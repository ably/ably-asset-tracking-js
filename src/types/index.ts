export type GeoJsonMessage = unknown;

export type LocationListener = (geoJsonMsg: GeoJsonMessage) => unknown;

export type StatusListener = (isOnline: boolean) => unknown;

export enum Accuracy {
  minimum = 1,
  low = 2,
  balanced = 3,
  high = 4,
  maximum = 5,
}

export type Resolution = {
  accuracy: Accuracy;
  desiredInterval: number;
  minimumDisplacement: number;
};

export enum ClientTypes {
  subscriber = 'subscriber',
  publisher = 'publisher',
}
