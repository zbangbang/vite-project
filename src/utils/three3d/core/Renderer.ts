import {
  SRGBColorSpace,
  WebGLRenderer,
  Scene,
  Camera as ThreeCamera,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

interface RendererOptions {
  canvas: HTMLCanvasElement;
  sizes: any;
  scene: Scene;
  camera: any;
  postprocessing?: boolean;
  composer?: EffectComposer | null;
}

export class Renderer {
  canvas: HTMLCanvasElement;
  sizes: any;
  scene: Scene;
  camera: any;
  postprocessing: boolean;
  composer: EffectComposer | null;
  instance!: WebGLRenderer;

  constructor({
    canvas,
    sizes,
    scene,
    camera,
    postprocessing = false,
    composer = null,
  }: RendererOptions) {
    this.canvas = canvas;
    this.sizes = sizes;
    this.scene = scene;
    this.camera = camera;
    this.postprocessing = postprocessing;
    this.composer = composer;
    this.setInstance();
  }
  setInstance(): void {
    this.instance = new WebGLRenderer({
      alpha: false,
      antialias: true,
      canvas: this.canvas,
    });
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);

    // 启用阴影
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = 2; // PCFSoftShadowMap
  }
  resize(): void {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }
  update(): void {
    if (this.postprocessing && this.composer) {
      this.composer.render();
    } else {
      this.instance.render(this.scene, this.camera.instance);
    }
  }
  destroy(): void {
    this.instance.dispose();
    this.instance.forceContextLoss();
  }
}
