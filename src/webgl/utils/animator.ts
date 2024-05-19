import { Transforms, AnimationTRS, AnimationPath, AnimationClip } from "@/app/type";
import { Node } from "../models/Node";

export class Animator {
  root: Node;
  currentAnimation: AnimationClip;
  deltaFrame: number = 0;
  currentFrame: number;
  reverse: boolean;
  replay: boolean;
  reset: boolean;
  fps: number;

  constructor(root: Node, animation: AnimationClip, currentFrame: number, reverse: boolean, replay: boolean, reset: boolean, fps: number) {
    this.root = root;
    this.currentAnimation = animation;
    this.currentFrame = currentFrame;
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