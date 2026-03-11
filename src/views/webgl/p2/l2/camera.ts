/*
 * @FilePath: camera.ts
 * @Author: @zhangl
 * @Date: 2025-08-11 14:46:58
 * @LastEditTime: 2026-01-21 14:48:32
 * @LastEditors: @zhangl
 * @Description: 相机变换拆解
 */
import * as twgl from 'twgl.js'
import { CameraShader } from './config'
twgl.setDefaults({ attribPrefix: 'a_' })
import dat from 'dat.gui'

const planePosition = [
  // left column front
  0, 0, 0, 30, 0, 0, 0, 150, 0, 0, 150, 0, 30, 0, 0, 30, 150, 0,

  // top rung front
  30, 0, 0, 100, 0, 0, 30, 30, 0, 30, 30, 0, 100, 0, 0, 100, 30, 0,

  // middle rung front
  30, 60, 0, 67, 60, 0, 30, 90, 0, 30, 90, 0, 67, 60, 0, 67, 90, 0,

  // left column back
  0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30,

  // top rung back
  30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,

  // middle rung back
  30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30,

  // top
  0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

  // top rung right
  100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30,

  // under top rung
  30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0,

  // between top rung and middle
  30, 30, 0, 30, 30, 30, 30, 60, 30, 30, 30, 0, 30, 60, 30, 30, 60, 0,

  // top of middle rung
  30, 60, 0, 30, 60, 30, 67, 60, 30, 30, 60, 0, 67, 60, 30, 67, 60, 0,

  // right of middle rung
  67, 60, 0, 67, 60, 30, 67, 90, 30, 67, 60, 0, 67, 90, 30, 67, 90, 0,

  // bottom of middle rung.
  30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

  // right of bottom
  30, 90, 0, 30, 90, 30, 30, 150, 30, 30, 90, 0, 30, 150, 30, 30, 150, 0,

  // bottom
  0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

  // left side
  0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0,
]

const colorArray = [
  // left column front
  200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70,
  120,

  // top rung front
  200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70,
  120,

  // middle rung front
  200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70,
  120,

  // left column back
  80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,

  // top rung back
  80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,

  // middle rung back
  80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200,

  // top
  70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200,
  210,

  // top rung right
  200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200,
  200, 70,

  // under top rung
  210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210,
  100, 70,

  // between top rung and middle
  210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210,
  160, 70,

  // top of middle rung
  70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180,
  210,

  // right of middle rung
  100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70,
  210,

  // bottom of middle rung.
  76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210,
  100,

  // right of bottom
  140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140,
  210, 80,

  // bottom
  90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130,
  110,

  // left side
  160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220,
  160, 160, 220,
]

let animate: any
let gui: dat.GUI | undefined = undefined
export const initCameraFrameBuffer = (gl: WebGL2RenderingContext) => {
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    CameraShader.vertexShaderSource,
    CameraShader.fragmentShaderSource,
  ])
  const planeArrays = {
    position: {
      numComponents: 3,
      data: planePosition,
    },
    color: {
      numComponents: 3,
      data: colorArray,
      type: gl.UNSIGNED_BYTE,
      normalize: true,
    },
  }
  const planeBufferInfo = twgl.createBufferInfoFromArrays(gl, planeArrays)

  let cameraAngle: dat.GUIController
  const initGui = () => {
    if (gui) return
    gui = new dat.GUI()
    let guiControls = {
      cameraAngle: 0,
    }
    cameraAngle = gui.add(guiControls, 'cameraAngle', 0, 720)

    cameraAngle.onChange((val: any) => {
      // projMtrix = twgl.m4.translate(originProjMtrix, twgl.v3.create(val, 0, 0))
    })
  }
  initGui()

  const total = 6
  const radius = 400
  const initMvp = () => {
    let projMatrix = twgl.m4.perspective(
      (60 * Math.PI) / 180,
      gl.canvas.width / gl.canvas.height,
      1,
      2000
    )

    let cameraMatrix = twgl.m4.rotationY(
      ((cameraAngle.getValue() % 360) * Math.PI) / 180
    )
    cameraMatrix = twgl.m4.translate(
      cameraMatrix,
      twgl.v3.create(0, 75, radius * 3)
    )

    // 相机看向某个位置
    // cameraMatrix = twgl.m4.lookAt(twgl.v3.create(cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]), twgl.v3.create(400, 0, 0), twgl.v3.create(0, 1, 0))
    let viewMatrix = twgl.m4.inverse(cameraMatrix)

    return { projMatrix, viewMatrix }
  }

  const render = () => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    gl.useProgram(programInfo.program)
    gl.enable(gl.DEPTH_TEST)

    let { projMatrix, viewMatrix } = initMvp()

    for (let i = 0; i < total; i++) {
      let angle = (i * Math.PI * 2) / total

      let modelPos = twgl.v3.create(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
      // 设置模型位置和旋转
      // let modelMatrix = twgl.m4.translation(modelPos)
      // modelMatrix = twgl.m4.rotateZ(modelMatrix, i * 5 * Math.PI / 180)
      // modelMatrix = twgl.m4.rotateY(modelMatrix, i * 15 * Math.PI / 180)

      // 模型看向相机，直接使用 lookAt 可能存在问题
      let cameraMatrix = twgl.m4.inverse(viewMatrix)
      let cameraPos = twgl.v3.create(
        cameraMatrix[12],
        cameraMatrix[13],
        cameraMatrix[14]
      )
      let matrix = twgl.m4.lookAt(modelPos, cameraPos, twgl.v3.create(0, 1, 0))
      let modelMatrix = twgl.m4.copy(matrix)
      modelMatrix = twgl.m4.rotateZ(modelMatrix, (i * 5 * Math.PI) / 180)
      modelMatrix = twgl.m4.rotateY(modelMatrix, (i * 15 * Math.PI) / 180)

      // // 2. 基于 lookAt 提取旋转部分 (左上 3x3 部分)
      // // 注意：twgl.m4 是列主序，所以索引 [0,1,2], [4,5,6], [8,9,10] 是旋转部分
      // let rotationOnlyMatrix = twgl.m4.identity() // 创建单位矩阵
      // // 复制旋转部分 (3x3)
      // for (let i = 0; i < 3; ++i) {
      //   for (let j = 0; j < 3; ++j) {
      //     rotationOnlyMatrix[i * 4 + j] = matrix[i * 4 + j]
      //   }
      // }

      // // 3. 创建包含模型位置的平移矩阵
      // let translationMatrix = twgl.m4.translation(modelPos)

      // // 4. 将旋转应用到平移后的矩阵上 (顺序很重要: 先旋转物体自身，再放置到世界位置)
      // // 通常做法是先有平移，再乘以旋转
      // let modelMatrix = twgl.m4.multiply(translationMatrix, rotationOnlyMatrix)
      // modelMatrix = twgl.m4.rotateZ(modelMatrix, (i * 5 * Math.PI) / 180)
      // modelMatrix = twgl.m4.rotateY(modelMatrix, (i * 15 * Math.PI) / 180)

      const uniforms = {
        u_projMatrix: projMatrix,
        u_viewMatrix: viewMatrix,
        u_modelMatrix: modelMatrix,
      }
      twgl.setBuffersAndAttributes(gl, programInfo, planeBufferInfo)
      twgl.setUniforms(programInfo, uniforms)
      twgl.drawBufferInfo(gl, planeBufferInfo, gl.TRIANGLES)
    }

    cameraAngle.setValue(cameraAngle.getValue() + 0.1)
    animate = requestAnimationFrame(render)
  }
  render()
}

export const clearCameraFrameBuffer = () => {
  gui && (gui.destroy(), gui = undefined)
  cancelAnimationFrame(animate)
}
