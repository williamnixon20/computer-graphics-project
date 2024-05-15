import { Transforms, AnimationTRS, AnimationPath, AnimationClip } from '../../app/type';
import { Node } from "../models/Node";

export class AnimationRunner {
  isPlaying: boolean = false;
  fps: number = 30;
  private root: Node;
  private currentFrame: number = 0;
  private deltaFrame: number = 0;
  private currentAnimation?: AnimationClip;

  constructor(root: Node, { fps = 30 } = {}) {
    this.currentAnimation = this.loadWalkingAnimation();
    this.fps = fps;
    this.root = root;
  }

  get Root() {
    return this.root;
  }
   
  get CurrentFrame() {
    return this.currentFrame;
  }

  get DeltaFrame() {
    return this.deltaFrame;
  }

  get CurrentAnimation() {
    return this.currentAnimation;
  }
   
  get length() {
    return this.currentAnimation!.frames.length;
  }

  private get frame() {
    return this.currentAnimation!.frames[this.currentFrame];
  }

  update(deltaSecond: number) {
    this.isPlaying = true;
    if (this.isPlaying) {
      this.deltaFrame += deltaSecond * this.fps;
      if (this.deltaFrame >= 1) { // 1 frame
        this.currentFrame = (this.currentFrame + Math.floor(this.deltaFrame)) % this.length;
        this.deltaFrame %= 1;
        this.updateSceneGraph();
      }
    }
  }

  private updateSceneGraph() {
    // Update scene graph with current frame
    const frame = this.frame;
    // Use root as the parent and traverse according to the frame
    this.updateNode(this.root, frame);
  }

  private updateNode(node: Node, frame: AnimationPath) {
    // Check if the current node should be updated
    if (node.name === frame.name && frame.keyframe) {
      this.updateNodeTRS(node, frame.keyframe);
    }

    // Traverse and update child nodes
    for (const frameChildName in frame.children) {
      const frameChild = frame.children[frameChildName];
      this.updateNode(node, frameChild);
    }
    for (const nodeChildName in node.children) {
      const nodeChild = node.children[nodeChildName];
      this.updateNode(nodeChild, frame);
    }
  }

  private updateNodeTRS(node: Node, trs: AnimationTRS) {
    // Update the node with the translation and rotation
    const transforms = this.convertToTransforms(trs);
    node.addTransform(transforms);
  }

  private loadWalkingAnimation(): AnimationClip {
    const frames: AnimationPath[] = [];

    // Define the number of frames for the walking animation
    const numFrames = 60;
    const stepAngle = 30; // Angle for leg movement

    // Iterate over the number of frames and create keyframes
    for (let i = 0; i < numFrames; i++) {
      const angle = (i % (numFrames / 2)) < (numFrames / 4) ? stepAngle : -stepAngle;

      // Calculate translation and rotation for left leg
      const leftLegTranslation = [0, -Math.sin(angle * Math.PI / 180), 0];
      const leftLegRotation = [angle, 0, 0];

      // Calculate translation and rotation for right leg
      const rightLegTranslation = [0, Math.sin(angle * Math.PI / 180), 0];
      const rightLegRotation = [-angle, 0, 0];

      // Create keyframes for both legs
      const leftLegKeyframe: AnimationTRS = {
        translation: [leftLegTranslation[0], leftLegTranslation[1], leftLegTranslation[2]],
        rotation: [leftLegRotation[0], leftLegRotation[1], leftLegRotation[2]],
      };

      const rightLegKeyframe: AnimationTRS = {
        translation: [rightLegTranslation[0], rightLegTranslation[1], rightLegTranslation[2]],
        rotation: [rightLegRotation[0], rightLegRotation[1], rightLegRotation[2]],
      };

      // Create AnimationPath for the current frame
      const frame: AnimationPath = {
        name: "waist",
        keyframe: {
          translation: [0, 0, 0], // No translation for the torso
          rotation: [0, 0, 0], // No rotation for the torso
        },
        children: {
          "left-leg": {
            name: "left-leg",
            keyframe: leftLegKeyframe,
          },
          "right-leg": {
            name: "right-leg",
            keyframe: rightLegKeyframe,
          },
        },
      };

      // Add the frame to the frames array
      frames.push(frame);
    }

    // Create the AnimationClip with the frames
    const walkingAnimation: AnimationClip = {
      name: "Walking",
      frames: frames,
    };

    return walkingAnimation;
  }

  private convertToTransforms(animationTRS: AnimationTRS): Transforms {
    const translate = animationTRS.translation
      ? { x: animationTRS.translation[0], y: animationTRS.translation[1], z: animationTRS.translation[2] }
      : { x: 0, y: 0, z: 0 };
  
    const rotate = animationTRS.rotation
      ? { x: animationTRS.rotation[0], y: animationTRS.rotation[1], z: animationTRS.rotation[2] }
      : { x: 0, y: 0, z: 0 };
  
    const scale = animationTRS.scale
      ? { x: animationTRS.scale[0], y: animationTRS.scale[1], z: animationTRS.scale[2] }
      : { x: 1, y: 1, z: 1 };
  
    return { translate, rotate, scale };
  }
}
