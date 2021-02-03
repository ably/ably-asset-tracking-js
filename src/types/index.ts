import { Feature, Point } from 'geojson';

type GeoJsonProperties = {
  accuracyHorizontal: number;
  altitude: number;
  bearing: number;
  speed: number;
  time: number;
};

export type Location = Feature<Point, GeoJsonProperties>;

export enum LocationUpdateType {
  Predicted = 'PREDICTED',
  Actual = 'ACTUAL',
}

export type LocationUpdate = {
  location: Location;
  intermediateLocations: Array<Location>;
  type: LocationUpdateType;
};

export type LocationListener = (locationUpdate: LocationUpdate) => unknown;

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
