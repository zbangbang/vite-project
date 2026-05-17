import { AxesHelper, Scene, Mesh } from "three";
import { EventEmitter, Sizes, Time } from "../utils";
import { Renderer } from "./Renderer";
import { Camera } from "./Camera";
import { geoMercator } from "d3-geo";

interface Mini3dConfig {
  isOrthographic?: boolean;
}

export class Mini3d extends EventEmitter {
  config: Mini3dConfig;
  canvas: HTMLCanvasElement;
  scene: Scene;
  sizes: Sizes;
  time: Time;
  camera: Camera;
  renderer: Renderer;

  constructor(canvas: HTMLCanvasElement, config: Mini3dConfig = {}) {
    super();
    let defaultConfig = {
      isOrthographic: false,
    };
    this.config = Object.assign({}, defaultConfig, config);
    this.canvas = canvas;
    this.scene = new Scene();
    this.sizes = new Sizes({ canvas: this.canvas });
    this.time = new Time();
    this.camera = new Camera(
      { sizes: this.sizes, scene: this.scene, canvas: this.canvas },
      {
        isOrthographic: this.config.isOrthographic || false,
      }
    );
    this.renderer = new Renderer({
      canvas: this.canvas,
      sizes: this.sizes,
      scene: this.scene,
      camera: this.camera,
    });
    this.sizes.on("resize", () => {
      this.resize();
    });
    this.time.on("tick", (delta: number) => {
      this.update(delta);
    });
  }
  /**
   * 设置AxesHelper
   * @param {*} size 尺寸
   * @returns
   */
  setAxesHelper(size = 250): boolean | void {
    if (!size) {
      return false;
    }
    let axes = new AxesHelper(size);
    this.scene.add(axes);
  }
  resize(): void {
    this.camera.resize();
    this.renderer.resize();
  }
  update(delta: number): void {
    this.camera.update();
    this.renderer.update();
  }
  /**
   * 销毁
   */
  destroy(): void {
    this.sizes.destroy();
    this.time.destroy();
    this.camera.destroy();
    this.renderer.destroy();
    this.scene.traverse((child: any) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        for (const key in child.material) {
          const value = child.material[key];
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });
    const parent = this.canvas.parentNode as HTMLElement;
    if (parent) {
      parent.removeChild(this.canvas);
    }
  }
}
