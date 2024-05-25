import { Transforms, AnimationTRS, AnimationPath, AnimationClip } from "@/app/type";
import { Node } from "../models/Node";

export class Animator {
  root: Node;
  currentAnimation: AnimationClip;
  deltaFrame: number = 0;
  currentFrame: number;
  tweening: string;
  reverse: boolean;
  replay: boolean;
  reset: boolean;
  fps: number;

  constructor(root: Node, animation: AnimationClip, currentFrame: number, tweening: string, reverse: boolean, replay: boolean, reset: boolean, fps: number) {
    this.root = root;
    this.currentAnimation = animation;
    this.currentFrame = currentFrame;
    this.tweening = tweening;
    this.reverse = reverse;
    this.replay = replay;
    this.reset = reset;
    this.fps = fps;
  }

  get length() {
    return this.currentAnimation!.frames.length;
  }

  get frame() {
    return this.currentAnimation!.frames[this.currentFrame];
  }

  update(deltaSecond: number) {
    this.deltaFrame += deltaSecond * this.fps;
    if (this.deltaFrame >= 1) {
      if (this.reverse) {
        this.currentFrame = (this.currentFrame - Math.floor(this.deltaFrame) + this.length) % this.length;
      } else {
        this.currentFrame = (this.currentFrame + Math.floor(this.deltaFrame)) % this.length;
      }
      this.deltaFrame %= 1;
      this.updateSceneGraph();
    } else {
      const nextFrame = this.reverse ? (this.currentFrame - 1 + this.length) % this.length : (this.currentFrame + 1) % this.length;
      this.updateInterpolation(nextFrame);
    }
  }

  updateInterpolation(nextFrame: number) {
    const frame = this.frame;
    const nextFrameData = this.currentAnimation.frames[nextFrame];
    this.interpolateNode(this.root, frame, nextFrameData);
  }

  interpolateNode(node: Node, frame: AnimationPath, nextFrame: AnimationPath) {
    if (node.name === frame.name && frame.keyframe) {
      this.interpolateNodeTRS(node, frame.keyframe, nextFrame.keyframe!);
    }

    for (const frameChildName in frame.children) {
      const frameChild = frame.children[frameChildName];
      const nextFrameChild = nextFrame.children![frameChildName];
      this.interpolateNode(node, frameChild, nextFrameChild);
    }

    for (const nodeChildName in node.children) {
      const nodeChild = node.children[nodeChildName];
      this.interpolateNode(nodeChild, frame, nextFrame);
    }
  }

  interpolateNodeTRS(node: Node, frame: AnimationTRS, nextFrame: AnimationTRS) {
    const transforms = this.convertToTransforms(frame);
    const nextTransforms = this.convertToTransforms(nextFrame);
    const interpolatedTransforms = this.interpolateTransforms(transforms, nextTransforms);
    node.setTransform(interpolatedTransforms);
  }

  interpolateTransforms(transforms: Transforms, nextTransform: Transforms): Transforms {
    const translate = {
      x: this.interpolate(transforms.translate.x, nextTransform.translate.x, this.tweening),
      y: this.interpolate(transforms.translate.y, nextTransform.translate.y, this.tweening),
      z: this.interpolate(transforms.translate.z, nextTransform.translate.z, this.tweening)
    };

    const rotate = {
      x: this.interpolate(transforms.rotate.x, nextTransform.rotate.x, this.tweening),
      y: this.interpolate(transforms.rotate.y, nextTransform.rotate.y, this.tweening),
      z: this.interpolate(transforms.rotate.z, nextTransform.rotate.z, this.tweening)
    };

    const scale = {
      x: this.interpolate(transforms.scale.x, nextTransform.scale.x, this.tweening),
      y: this.interpolate(transforms.scale.y, nextTransform.scale.y, this.tweening),
      z: this.interpolate(transforms.scale.z, nextTransform.scale.z, this.tweening)
    };

    return { translate, rotate, scale };
  }

  interpolate(a: number, b: number, tweening: string): number {
    switch (tweening) {
      case "linear":
        return a + (b - a) * this.deltaFrame;
      case "sine":
        return a + (b - a) * Math.sin(this.deltaFrame * Math.PI / 2);
      case "quad":
        return a + (b - a) * Math.pow(this.deltaFrame, 2);
      case "cubic":
        return a + (b - a) * Math.pow(this.deltaFrame, 3);
      case "quart":
        return a + (b - a) * Math.pow(this.deltaFrame, 4);
      case "quint":
        return a + (b - a) * Math.pow(this.deltaFrame, 5);
      case "expo":
        return a + (b - a) * Math.pow(2, 10 * (this.deltaFrame - 1));
      default:
        return a + (b - a) * this.deltaFrame;
    }
  }

  updateSceneGraph() {
    const frame = this.frame;
    this.updateNode(this.root, frame);
  }

  updateNode(node: Node, frame: AnimationPath) {
    if (node.name === frame.name && frame.keyframe) {
      this.updateNodeTRS(node, frame.keyframe);
    }

    for (const frameChildName in frame.children) {
      const frameChild = frame.children[frameChildName];
      this.updateNode(node, frameChild);
    }

    for (const nodeChildName in node.children) {
      const nodeChild = node.children[nodeChildName];
      this.updateNode(nodeChild, frame);
    }
  }

  updateNodeTRS(node: Node, trs: AnimationTRS) {
    const transforms = this.convertToTransforms(trs);
    node.setTransform(transforms);
  }

  convertToTransforms(animationTRS: AnimationTRS): Transforms {
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
