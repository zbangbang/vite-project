import { EventEmitter } from "./EventEmitter";
import { RafFn } from "./RafFn";
import * as THREE from "three";

export class Time extends EventEmitter {
  start: number;
  current: number;
  elapsed: number;
  delta: number;
  clock: THREE.Clock;
  raf: ReturnType<typeof RafFn>;

  constructor() {
    super();
    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16;
    this.clock = new THREE.Clock();
    this.raf = RafFn(() => this.tick());
    this.raf.start();
  }
  tick(): void {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    this.emit("tick", delta, elapsedTime);
  }
  destroy(): void {
    this.pause();
    this.off("tick");
  }
  pause(): void {
    this.raf.pause();
  }
  resume(): void {
    this.raf.resume();
  }
  isActive(): void {
    this.raf.isActive();
  }
}
