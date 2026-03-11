/*
 * @FilePath: multiObject.ts
 * @Author: @zhangl
 * @Date: 2025-08-11 14:46:58
 * @LastEditTime: 2026-01-22 12:59:27
 * @LastEditors: @zhangl
 * @Description: 多几何体
 */
import * as twgl from 'twgl.js'
import { MultiObjectShader } from './config'
twgl.setDefaults({ attribPrefix: 'a_' })
import dat from 'dat.gui'
import flattenedPrimitives from '@/utils/webgl'
import { cloneDeep } from 'lodash'

let animate: any
let gui: dat.GUI | undefined = undefined
export const initMultiObjectFrameBuffer = (gl: WebGL2RenderingContext) => {
  const initMvp = () => {
    const projMatrix = twgl.m4.perspective(
      (60 * Math.PI) / 180,
      gl.canvas.width / gl.canvas.height,
      1,
      2000
    )

    const cameraMatrix = twgl.m4.lookAt(twgl.v3.create(0, 0, 200), twgl.v3.create(0, 0, 0), twgl.v3.create(0, 1, 0))
    const viewMatrix = twgl.m4.inverse(cameraMatrix)

    return { projMatrix, viewMatrix }
  }

  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    MultiObjectShader.vertexShaderSource,
    MultiObjectShader.fragmentShaderSource,
  ])

  const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 16, 12, 10)
  const sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo)
  const cubeBufferInfo = flattenedPrimitives.createCubeBufferInfo(gl, 8)
  const cubeVAO = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo)

  let { projMatrix, viewMatrix } = initMvp()
  const objects = [{
    vao: sphereVAO,
    bufferInfo: sphereBufferInfo,
    uniforms: {
      u_multiColor: [1, 0.5, 0.5, 1],
      u_mvpMatrix: twgl.m4.identity(),
    },
    translation: [0, 0, 0],
  }, {
    vao: cubeVAO,
    bufferInfo: cubeBufferInfo,
    uniforms: {
      u_multiColor: [0.5, 1, 0.5, 1],
      u_mvpMatrix: twgl.m4.identity(),
    },
    translation: [0, 0, 0]
  }]

  const modelList: any[] = []
  const initModelList = () => {
    for (let i = 0; i < 50; i++) {
      let model = cloneDeep(objects[Math.round(Math.random())])
      model.translation = [Math.round(Math.random() * 200) - 100, Math.round(Math.random() * 200) - 100, Math.round(Math.random() * 100) - 50]

      modelList.push(model)
    }
  }
  initModelList()

  const render = (time?: any) => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)

    gl.useProgram(programInfo.program)

    modelList.forEach(model => {
      let modelMatrix = twgl.m4.translation(
        twgl.v3.create(...model.translation)
      )
      modelMatrix = twgl.m4.rotateX(modelMatrix, time * 0.0005)

      let uniforms = model.uniforms
      uniforms.u_mvpMatrix = twgl.m4.multiply(projMatrix, twgl.m4.multiply(viewMatrix, modelMatrix))

      gl.bindVertexArray(model.vao)
      twgl.setUniforms(programInfo, uniforms)
      twgl.drawBufferInfo(gl, model.bufferInfo)
    })

    animate = requestAnimationFrame(render)
  }
  render()
}

export const clearMultiObjectFrameBuffer = () => {
  gui && (gui.destroy(), (gui = undefined))
  cancelAnimationFrame(animate)
}
