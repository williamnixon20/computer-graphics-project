export interface Transforms {
  translate: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  rotate: { x: number; y: number; z: number };
}

export interface ArticulatedDescriptions {
  type?: string;
  name: string;
  draw?: boolean;
  translation?: number[];
  rotation?: number[];
  scale?: number[];
  children?: ArticulatedDescriptions[];
  colors?: number[];
}

export interface HollowDescriptions {
  type?: string;
  name: string;
  positions: number[];
  colors: number[];
  normals: number[];
}

export interface CameraInformation {
  cameraAngleXRadians: number;
  cameraAngleYRadians: number;
  fieldOfViewRadians: number;
  radius: number;
}