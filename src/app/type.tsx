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
  projType: string;
  translateX: number;
  translateY: number;
  rotateX: number; // in radians
  rotateY: number; // in radians
  radiusRotate: number;
}

export interface AnimationTRS {
  translation?: number[];
  rotation?: number[];
  scale?: number[];
}

export interface AnimationPath {
  name?: string;
  keyframe?: AnimationTRS;
  children?: {
    [childName: string]: AnimationPath;
  }
}

export interface AnimationClip {
  name: string,
  frames: AnimationPath[];
}

export interface ShadingInfo {
  mode: number;
  ambientColor: number[];
  shininess: number;
  specularColor: number[];
  diffuseColor: number[];
  texture?: WebGLTexture;
}