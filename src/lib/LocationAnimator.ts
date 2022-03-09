import {
  Location,
  LocationUpdate,
  Position,
  UpdateMapCameraListener,
  UpdateMapMarkerListener,
} from '../types/index.js';

type AnimationStep = {
  startPosition: Position;
  endPosition: Position;
  durationInMilliseconds: number;
};

type AnimationFrame = {
  position: Position;
};

export class LocationAnimator {
  private DURATION_UNKNOWN = -1;
  private updateMapMarkerListener: UpdateMapMarkerListener;
  private updateCameraListener?: UpdateMapCameraListener;
  private previousFinalPosition?: Position;
  private FPS: number;
  private animationSteps: AnimationStep[];
  private IDLE_ANIMATION_LOOP_DELAY: number;
  private animationFramesBuffer: AnimationFrame[];
  private stepsSinceLastCameraUpdate: number;
  /**
   * Intentional animation delay that is introduced to avoid map marker stops when the new location update
   * is taking longer than the expected desired interval.
   * The default value is 2000ms but this can be tweaked according to current needs.
   */
  intentionalAnimationDelayInMilliseconds: number;
  /**
   * Number of animation steps after which the camera should be updated.
   * The lower the value the more often the camera will be updated.
   */
  numberOfStepsToUpdateCameraAfter: number;
  /**
   * If enabled the smooth animation is disabled and the map marker snaps to each new location immediately.
   */
  snapToLocation: boolean;

  constructor(updateMapMarkerListener: UpdateMapMarkerListener, updateCameraListener?: UpdateMapCameraListener) {
    this.updateMapMarkerListener = updateMapMarkerListener;
    this.updateCameraListener = updateCameraListener;
    this.previousFinalPosition = undefined;
    this.intentionalAnimationDelayInMilliseconds = 2000;
    this.FPS = 60;
    this.animationSteps = [];
    this.IDLE_ANIMATION_LOOP_DELAY = 50;
    this.animationStepsLoop();

    this.monitorWindowFps();

    this.animationFramesBuffer = [];
    this.animationLoop();

    this.stepsSinceLastCameraUpdate = 0;
    this.numberOfStepsToUpdateCameraAfter = 15;
    this.snapToLocation = false;
  }

  /**
   * Infinite loop that monitors and updates the current FPS value of the web browser window.
   * This is required due to the usage of window.requestAnimationFrame() which is not called at a constant rate.
   */
  private async monitorWindowFps() {
    const frames: number[] = [];

    const detectFpsLoop = () => {
      window.requestAnimationFrame((timestamp: number) => {
        while (frames.length > 0 && frames[0] <= timestamp - 1000) {
          frames.shift();
        }
        frames.push(timestamp);
        this.FPS = frames.length;
        detectFpsLoop();
      });
    };

    detectFpsLoop();
  }

  /**
   * Processes the [locationUpdate] and changes it into animation steps. This should be called each time a new
   * location update is received from the [Subscriber].
   */
  async animateLocationUpdate(locationUpdate: LocationUpdate, expectedDesiredInterval: number): Promise<void> {
    const animationSteps = this.createAnimationSteps(locationUpdate);
    const expectedAnimationDuration = this.intentionalAnimationDelayInMilliseconds + expectedDesiredInterval;

    this.animationSteps = this.animationSteps.concat(animationSteps);
    const animationStepDuration = expectedAnimationDuration / this.animationSteps.length;
    this.animationSteps.forEach((step) => {
      step.durationInMilliseconds = animationStepDuration;
    });
    this.previousFinalPosition = this.animationSteps[this.animationSteps.length - 1].endPosition;
  }

  /**
   * Creates an array of animation steps from a [LocationUpdate].
   */
  private createAnimationSteps(locationUpdate: LocationUpdate): AnimationStep[] {
    const allLocations: Location[] = [...locationUpdate.skippedLocations, locationUpdate.location];
    return allLocations.reduce((steps: AnimationStep[], location: Location, index: number) => {
      let startPosition: Position;
      if (index === 0) {
        startPosition = this.previousFinalPosition ?? this.asPosition(allLocations[0]);
      } else {
        startPosition = this.asPosition(allLocations[index - 1]);
      }
      steps.push({
        startPosition,
        endPosition: this.asPosition(location),
        durationInMilliseconds: this.DURATION_UNKNOWN,
      });
      return steps;
    }, []);
  }

  /**
   * Creates an array of animation frames from a [AnimationStep].
   */
  private animateStep(step: AnimationStep) {
    this.stepsSinceLastCameraUpdate++;
    this.animationFramesBuffer = [];

    // If animation is disabled we should simply push the end position as the only animation frame.
    if (this.snapToLocation) {
      this.animationFramesBuffer.push({ position: step.endPosition });
      return;
    }

    const numberOfFrames = (step.durationInMilliseconds / 1000) * this.FPS;
    for (let frameNumber = 0; frameNumber <= numberOfFrames; frameNumber++) {
      const frameProgress = frameNumber / numberOfFrames;
      const targetPosition = this.interpolatePosition(frameProgress, step.startPosition, step.endPosition);
      this.animationFramesBuffer.push({ position: targetPosition });
    }
  }

  /**
   * Infinite loop that takes the animation steps, processes them * and delays the next step processing
   * by the current step duration.
   * Additionally, it updates the camera listener whenever a required amount of steps is processed.
   */
  private async animationStepsLoop() {
    const step = this.animationSteps.shift();
    if (!step) {
      window.setTimeout(() => {
        this.animationStepsLoop();
      }, this.IDLE_ANIMATION_LOOP_DELAY);
      return;
    }

    this.animateStep(step);

    if (this.stepsSinceLastCameraUpdate >= this.numberOfStepsToUpdateCameraAfter && this.updateCameraListener) {
      this.stepsSinceLastCameraUpdate = 0;
      this.updateCameraListener(step.endPosition);
    }

    // We need this delay in order to be able to respond to animation frames when the speed needs adjusting
    window.setTimeout(() => {
      this.animationStepsLoop();
    }, step.durationInMilliseconds);
  }

  /**
   * Infinite loop that takes the animation frames and notifies the map marker listener about new position.
   */
  private async animationLoop() {
    const frame = this.animationFramesBuffer.shift();
    if (!frame) {
      window.requestAnimationFrame(() => {
        this.animationLoop();
      });
      return;
    }

    this.updateMapMarkerListener(frame.position);

    window.requestAnimationFrame(() => {
      this.animationLoop();
    });
  }

  /**
   * Interpolates two positions. Creates a new positions that is moved on the line between the
   * [start] and [end] positions by the [progress] amount. The accuracy is also interpolated but
   * the bearing is taken from the [end] position.
   */
  private interpolatePosition(progress: number, start: Position, end: Position): Position {
    return {
      latitude: this.interpolateLinear(progress, start.latitude, end.latitude),
      longitude: this.interpolateLinear(progress, start.longitude, end.longitude),
      bearing: end.bearing,
      accuracy: this.interpolateLinear(progress, start.accuracy, end.accuracy),
    };
  }

  /**
   * Interpolates two numbers.
   */
  private interpolateLinear(fraction: number, a: number, b: number): number {
    return (b - a) * fraction + a;
  }

  /**
   * Maps a [Location] to a [Position].
   */
  private asPosition(location: Location): Position {
    return {
      latitude: location.geometry.coordinates[1],
      longitude: location.geometry.coordinates[0],
      bearing: location.properties.bearing,
      accuracy: location.properties.accuracyHorizontal,
    };
  }
}
