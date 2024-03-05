import { onMounted, ref } from "vue"
import { IThreeParam } from "./types"

/**
 * @Date: 2024-02-28 10:38:00
 * @Description: 三维
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @return {*}
 */
export default function useThreeHook(gl: WebGLRenderingContext, program: WebGLProgram) {
  // 绘制三维
  const drawThree = (threeHookParams: IThreeParam) => {
    let posArr = new Float32Array([
      // left column front
      0, 0, 0,
      0, 150, 0,
      30, 0, 0,
      0, 150, 0,
      30, 150, 0,
      30, 0, 0,

      // top rung front
      30, 0, 0,
      30, 30, 0,
      100, 0, 0,
      30, 30, 0,
      100, 30, 0,
      100, 0, 0,

      // middle rung front
      30, 60, 0,
      30, 90, 0,
      67, 60, 0,
      30, 90, 0,
      67, 90, 0,
      67, 60, 0,

      // left column back
      0, 0, 30,
      30, 0, 30,
      0, 150, 30,
      0, 150, 30,
      30, 0, 30,
      30, 150, 30,

      // top rung back
      30, 0, 30,
      100, 0, 30,
      30, 30, 30,
      30, 30, 30,
      100, 0, 30,
      100, 30, 30,

      // middle rung back
      30, 60, 30,
      67, 60, 30,
      30, 90, 30,
      30, 90, 30,
      67, 60, 30,
      67, 90, 30,

      // top
      0, 0, 0,
      100, 0, 0,
      100, 0, 30,
      0, 0, 0,
      100, 0, 30,
      0, 0, 30,

      // top rung right
      100, 0, 0,
      100, 30, 0,
      100, 30, 30,
      100, 0, 0,
      100, 30, 30,
      100, 0, 30,

      // under top rung
      30, 30, 0,
      30, 30, 30,
      100, 30, 30,
      30, 30, 0,
      100, 30, 30,
      100, 30, 0,

      // between top rung and middle
      30, 30, 0,
      30, 60, 30,
      30, 30, 30,
      30, 30, 0,
      30, 60, 0,
      30, 60, 30,

      // top of middle rung
      30, 60, 0,
      67, 60, 30,
      30, 60, 30,
      30, 60, 0,
      67, 60, 0,
      67, 60, 30,

      // right of middle rung
      67, 60, 0,
      67, 90, 30,
      67, 60, 30,
      67, 60, 0,
      67, 90, 0,
      67, 90, 30,

      // bottom of middle rung.
      30, 90, 0,
      30, 90, 30,
      67, 90, 30,
      30, 90, 0,
      67, 90, 30,
      67, 90, 0,

      // right of bottom
      30, 90, 0,
      30, 150, 30,
      30, 90, 30,
      30, 90, 0,
      30, 150, 0,
      30, 150, 30,

      // bottom
      0, 150, 0,
      0, 150, 30,
      30, 150, 30,
      0, 150, 0,
      30, 150, 30,
      30, 150, 0,

      // left side
      0, 0, 0,
      0, 0, 30,
      0, 150, 30,
      0, 0, 0,
      0, 150, 30,
      0, 150, 0
    ])
    let colorArr = new Uint8Array([
      // left column front
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,

      // top rung front
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,

      // middle rung front
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,

      // left column back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

      // top rung back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

      // middle rung back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

      // top
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,

      // top rung right
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,

      // under top rung
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,

      // between top rung and middle
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,

      // top of middle rung
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,

      // right of middle rung
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,

      // bottom of middle rung.
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,

      // right of bottom
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,

      // bottom
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,

      // left side
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220
    ])
    const FSIZE = posArr.BYTES_PER_ELEMENT

    let aspect = (gl!.canvas as HTMLCanvasElement).clientWidth / (gl!.canvas as HTMLCanvasElement).clientHeight
    let zNear = 1
    let zFar = 2000
    let matrix = m4.perspective(
      60,
      aspect,
      zNear,
      zFar
    )
    matrix = m4.translate(matrix, threeHookParams.xValue, threeHookParams.yValue, threeHookParams.zValue)
    matrix = m4.xRotate(matrix, (threeHookParams.xRotate / 180) * Math.PI)
    matrix = m4.yRotate(matrix, (threeHookParams.yRotate / 180) * Math.PI)
    matrix = m4.zRotate(matrix, (threeHookParams.zRotate / 180) * Math.PI)
    matrix = m4.scale(matrix, threeHookParams.xScale, threeHookParams.yScale, threeHookParams.zScale)
    let u_Matrix = gl!.getUniformLocation(program!, 'u_Matrix')
    gl!.uniformMatrix4fv(u_Matrix, false, matrix as any)

    let a_Color = gl!.getAttribLocation(program!, 'a_Color')
    let colorBuffer = gl!.createBuffer()
    gl!.bindBuffer(gl!.ARRAY_BUFFER, colorBuffer)
    gl!.bufferData(gl!.ARRAY_BUFFER, colorArr, gl!.STATIC_DRAW)
    gl!.vertexAttribPointer(a_Color, 3, gl!.UNSIGNED_BYTE, true, 0, 0)
    gl!.enableVertexAttribArray(a_Color)
    // gl!.uniform4fv(a_Color, [1.0, 0.0, 0.0, 1.0])

    let a_Position = gl!.getAttribLocation(program!, 'a_Position')
    let posBuffer = gl!.createBuffer()
    gl!.bindBuffer(gl!.ARRAY_BUFFER, posBuffer)
    gl!.bufferData(gl!.ARRAY_BUFFER, posArr, gl!.STATIC_DRAW)
    gl!.vertexAttribPointer(a_Position, 3, gl!.FLOAT, false, 0, 0)
    gl!.enableVertexAttribArray(a_Position)

    gl!.clearColor(0, 0, 0, 0)
    gl!.clear(gl!.COLOR_BUFFER_BIT)
    gl!.drawArrays(gl!.TRIANGLES, 0, 96)
  }
  /**
   * @Date: 2024-02-26 14:06:59
   * @Description: 重新绘制
   * @return {*}
   */
  const reDrawTrangle = (threeHookParams: IThreeParam) => {
    // 屏幕坐标归一化
    // let matrix = m4.projection(
    //   (gl!.canvas as HTMLCanvasElement).clientWidth,
    //   (gl!.canvas as HTMLCanvasElement).clientHeight,
    //   400
    // )

    // 正射投影
    // let matrix = m4.orthographic(
    //   0,
    //   (gl!.canvas as HTMLCanvasElement).clientWidth,
    //   (gl!.canvas as HTMLCanvasElement).clientHeight,
    //   0,
    //   400,
    //   -400
    // )

    // 透视投影
    let aspect = (gl!.canvas as HTMLCanvasElement).clientWidth / (gl!.canvas as HTMLCanvasElement).clientHeight
    let zNear = 1
    let zFar = 2000
    let matrix = m4.perspective(
      60,
      aspect,
      zNear,
      zFar
    )
    matrix = m4.translate(matrix, threeHookParams.xValue, threeHookParams.yValue, threeHookParams.zValue)
    matrix = m4.xRotate(matrix, (threeHookParams.xRotate / 180) * Math.PI)
    matrix = m4.yRotate(matrix, (threeHookParams.yRotate / 180) * Math.PI)
    matrix = m4.zRotate(matrix, (threeHookParams.zRotate / 180) * Math.PI)
    matrix = m4.scale(matrix, threeHookParams.xScale, threeHookParams.yScale, threeHookParams.zScale)
    let u_Matrix = gl!.getUniformLocation(program!, 'u_Matrix')
    gl!.uniformMatrix4fv(u_Matrix, false, matrix as any)

    gl!.clearColor(0, 0, 0, 0)
    gl!.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl!.drawArrays(gl!.TRIANGLES, 0, 96)
  }

  return {
    drawThree,
    reDrawTrangle
  }
}