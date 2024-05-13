import { AnimationClip } from '../../app/type';

export class AnimationRunner {
  isPlaying: boolean = false;
  fps: number = 30;
  private root: Object;
  private currentFrame: number = 0;
  private deltaFrame: number = 0;
  private currentAnimation?: AnimationClip;

  constructor(animFile: string, root: Object, { fps = 30 } = {}) {
    this.currentAnimation = this.load(animFile);
    this.fps = fps;
    this.root = root;
  }
   
  get CurrentFrame() {
    return this.currentFrame;
  }
   
  get length() {
    return this.currentAnimation!.frames.length;
  }

  private get frame() {
    return this.currentAnimation!.frames[this.currentFrame];
  }

  update(deltaSecond: number) {
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
  }

  private load(animFile: string): AnimationClip | undefined {
    // Load animation from file
    return;
  }
}
