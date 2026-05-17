import { EventEmitter } from "./EventEmitter";

export class Sizes extends EventEmitter {
  canvas: HTMLCanvasElement;
  pixelRatio: number;
  width!: number;
  height!: number;

  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    super();
    this.canvas = canvas;
    this.pixelRatio = 2;
    this.init();
    window.addEventListener("resize", () => {
      this.init();
      this.emit("resize");
    });
  }
  init(): void {
    const parent = this.canvas.parentNode as HTMLElement;
    this.width = parent?.offsetWidth || 0;
    this.height = parent?.offsetHeight || 0;
    this.pixelRatio = this.pixelRatio || Math.min(window.devicePixelRatio, 2);
  }
  destroy(): void {
    this.off("resize");
  }
}
