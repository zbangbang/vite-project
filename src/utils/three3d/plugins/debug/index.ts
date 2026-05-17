/*
 * @Author: wanglx
 * @Date: 2025-11-04 16:04:02
 * @LastEditors: wanglx
 * @LastEditTime: 2025-11-06 16:41:30
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import GUI from "three/addons/libs/lil-gui.module.min.js";

export class Debug {
  active: boolean;
  instance?: GUI;

  constructor(active = false) {
    this.active = active;
    if (window.location.hash === "#debug") {
      this.active = true;
    }
    if (this.active) {
      this.instance = new GUI();
      this.instance.close();
    }
  }
  update(): void {}
  destroy(): void {
    if (this.active && this.instance) {
      this.instance.destroy();
    }
  }
}
