/**
 * @Date: 2024-02-29 10:56:12
 * @Description: 三维变换参数
 * @return {*}
 */
export interface IThreeParam {
  xValue: number
  xRange?: number[]
  yValue: number
  yRange?: number[]
  zValue: number
  zRange?: number[]
  xRotate: number
  yRotate: number
  zRotate: number
  rRange?: number[]
  xScale: number
  sxRange?: number[]
  yScale: number
  syRange?: number[]
  zScale: number
}