import { Feature, Point } from 'geojson';

export type SubscriberOptions = {
  ablyOptions: AblyTypes.ClientOptions;
  onLocationUpdate?: api.LocationListener;
  onStatusUpdate?: api.StatusListener;
  loggerOptions?: LoggerOptions;
  resolution?: api.Resolution;
};

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
