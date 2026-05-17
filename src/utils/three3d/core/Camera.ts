/*
 * @Author: wanglx
 * @Date: 2025-11-04 16:04:02
 * @LastEditors: wanglx
 * @LastEditTime: 2025-11-06 11:11:12
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { PerspectiveCamera, OrthographicCamera, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface CameraContext {
  sizes: any;
  scene: any;
  canvas: HTMLCanvasElement;
}

interface CameraOptions {
  isOrthographic?: boolean;
}

export class Camera {
  sizes: any;
  scene: any;
  canvas: HTMLCanvasElement;
  options: { isOrthographic: boolean };
  instance!: PerspectiveCamera | OrthographicCamera;
  controls!: OrbitControls;

  constructor(
    { sizes, scene, canvas }: CameraContext,
    options: CameraOptions = { isOrthographic: false }
  ) {
    this.sizes = sizes;
    this.scene = scene;
    this.canvas = canvas;
    this.options = Object.assign({ isOrthographic: false }, options);
    this.setInstance();
  }
  setInstance(): void {
    this.setCamera(this.options.isOrthographic);

    this.instance.position.set(10, 10, 10);

    this.scene.add(this.instance);
  }
  /**
   * 设置当前相机
   * @param {*} isOrthographic true 默认正交相机，false 透视相机
   */
  setCamera(isOrthographic: boolean = true): void {
    let aspect = this.sizes.width / this.sizes.height;
    if (isOrthographic) {
      let s = 120;
      this.instance = new OrthographicCamera(
        -s * aspect,
        s * aspect,
        s,
        -s,
        1,
        10000
      );
    } else {
      // 透视相机
      this.instance = new PerspectiveCamera(45, aspect, 1, 10000);
    }
    this.setControls();
  }
  setControls(): void {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.update();
  }
  resize(): void {
    let aspect = this.sizes.width / this.sizes.height;
    if (this.options.isOrthographic) {
      let s = 120;
      const camera = this.instance as OrthographicCamera;
      camera.left = -s * aspect;
      camera.right = s * aspect;
      camera.top = s;
      camera.bottom = -s;
    } else {
      const camera = this.instance as PerspectiveCamera;
      camera.aspect = aspect;
    }
    this.instance.updateProjectionMatrix();
  }
  update(): void {
    this.controls.update();
  }
  destroy(): void {
    this.controls.dispose();
  }
}
