export type GeoJsonMessage = unknown;

export type LocationListener = (geoJsonMsg: GeoJsonMessage) => unknown;

export type StatusListener = (isOnline: boolean) => unknown;

export enum Accuracy {
  Minimum = 1,
  Low = 2,
  Balanced = 3,
  High = 4,
  Maximum = 5,
}

export type Resolution = {
  accuracy: Accuracy;
  desiredInterval: number;
  minimumDisplacement: number;
};

export enum ClientTypes {
  Subscriber = 'subscriber',
  Publisher = 'publisher',
}
