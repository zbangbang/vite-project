/**
 * Various 2d math functions.
 *
 * @module webgl-2d-math
 */
declare const m3: {
  /**
   * Takes two Matrix3s, a and b, and computes the product in the order
   * that pre-composes b with a.  In other words, the matrix returned will
   * @param {module:webgl-2d-math.Matrix3} a A matrix.
   * @param {module:webgl-2d-math.Matrix3} b A matrix.
   * @return {module:webgl-2d-math.Matrix3} the result.
   * @memberOf module:webgl-2d-math
   */
  multiply(a: number[], b: number[]): number[];

  /**
   * Creates a 3x3 identity matrix
   * @return {module:webgl2-2d-math.Matrix3} an identity matrix
   */
  identity(): number[];

  /**
   * Creates a 2D projection matrix
   * @param {number} width width in pixels
   * @param {number} height height in pixels
   * @return {module:webgl-2d-math.Matrix3} a projection matrix that converts from pixels to clipspace with Y = 0 at the top.
   * @memberOf module:webgl-2d-math
   */
  projection(width: number, height: number): number[];

  /**
   * Multiplies by a 2D projection matrix
   * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
   * @param {number} width width in pixels
   * @param {number} height height in pixels
   * @return {module:webgl-2d-math.Matrix3} the result
   * @memberOf module:webgl-2d-math
   */
  project(m: number[], width: number, height: number): number[];

  /**
   * Creates a 2D translation matrix
   * @param {number} tx amount to translate in x
   * @param {number} ty amount to translate in y
   * @return {module:webgl-2d-math.Matrix3} a translation matrix that translates by tx and ty.
   * @memberOf module:webgl-2d-math
   */
  translation(tx: number, ty: number): number[];

  /**
   * Multiplies by a 2D translation matrix
   * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
   * @param {number} tx amount to translate in x
   * @param {number} ty amount to translate in y
   * @return {module:webgl-2d-math.Matrix3} the result
   * @memberOf module:webgl-2d-math
   */
  translate(m: number[], tx: number, ty: number): number[];

  /**
   * Creates a 2D rotation matrix
   * @param {number} angleInRadians amount to rotate in radians
   * @return {module:webgl-2d-math.Matrix3} a rotation matrix that rotates by angleInRadians
   * @memberOf module:webgl-2d-math
   */
  rotation(angleInRadians: number): number[];

  /**
   * Multiplies by a 2D rotation matrix
   * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
   * @param {number} angleInRadians amount to rotate in radians
   * @return {module:webgl-2d-math.Matrix3} the result
   * @memberOf module:webgl-2d-math
   */
  rotate(m: number[], angleInRadians: number): number[];

  /**
   * Creates a 2D scaling matrix
   * @param {number} sx amount to scale in x
   * @param {number} sy amount to scale in y
   * @return {module:webgl-2d-math.Matrix3} a scale matrix that scales by sx and sy.
   * @memberOf module:webgl-2d-math
   */
  scaling(sx: number, sy: number): number[];

  /**
   * Multiplies by a 2D scaling matrix
   * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
   * @param {number} sx amount to scale in x
   * @param {number} sy amount to scale in y
   * @return {module:webgl-2d-math.Matrix3} the result
   * @memberOf module:webgl-2d-math
   */
  scale(m: number[], sx: number, sy: number): number[];

  dot(x1: number, y1: number, x2: number, y2: number): number;

  distance(x1: number, y1: number, x2: number, y2: number): number;

  normalize(x: number, y: number): [number, number];

  reflect(ix: number, iy: number, nx: number, ny: number): [number, number];

  /**
   * 弧度转角度
   * @return {*}
   */
  radToDeg(r: number): number;

  /**
   * 角度转弧度
   * @return {number}
   */
  degToRad(r: number): number;

  transformPoint(m: number[], v: number): [number, number];

  inverse(m: number[]): number[];
}