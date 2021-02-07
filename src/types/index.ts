import { Feature, Point } from 'geojson';
import { Accuracy, LocationUpdateType } from '../lib/constants';

type GeoJsonProperties = {
  accuracyHorizontal: number;
  altitude: number;
  bearing: number;
  speed: number;
  time: number;
};

export type Location = Feature<Point, GeoJsonProperties>;

export type LocationUpdate = {
  location: Location;
  intermediateLocations: Array<Location>;
  type: LocationUpdateType;
};

export type LocationListener = (locationUpdate: LocationUpdate) => unknown;

export type StatusListener = (isOnline: boolean) => unknown;

export type Resolution = {
  accuracy: Accuracy;
  desiredInterval: number;
  minimumDisplacement: number;
};
