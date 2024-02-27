
/**
 * Constructor of Matrix4
 * If opt_src is specified, new matrix is initialized by opt_src.
 * Otherwise, new matrix is initialized by identity matrix.
 * @param opt_src source matrix(option)
 */
declare class Matrix {
  /**
   * Set the identity matrix.
   * @return this
   */
  setIdentity();

  /**
   * Copy matrix.
   * @param src source matrix
   * @return this
   */
  set(src: any);
}