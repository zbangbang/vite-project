
/**
 * @Date: 2024-02-21 13:21:43
 * @Description: webgl工具类
 * @return {*}
 */
declare const webglUtils: {
  /**
   * Resize a canvas to match the size its displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {number} [multiplier] amount to multiply by.
   *    Pass in window.devicePixelRatio for native pixels.
   * @return {boolean} true if the canvas was resized.
   * @memberOf module:webgl-utils
   */
  resizeCanvasToDisplaySize(canvas: HTMLCanvasElement | OffscreenCanvas, multiplier?: number): boolean;
}