/*
 * @FilePath: texture.ts
 * @Author: @zhangl
 * @Date: 2025-08-11 14:46:58
 * @LastEditTime: 2026-01-21 14:48:26
 * @LastEditors: @zhangl
 * @Description: 纹理
 */
import * as twgl from 'twgl.js'
import { TextureShader } from './config'
twgl.setDefaults({ attribPrefix: 'a_' })
import dat from 'dat.gui'
import textureImg from '@/assets/images/webgl/f-texture.png'

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

const texcoordArray = [
  // left column front
  0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

  // top rung front
  0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

  // middle rung front
  0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

  // left column back
  0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

  // top rung back
  0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

  // middle rung back
  0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

  // top
  0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

  // top rung right
  0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

  // under top rung
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

  // between top rung and middle
  0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

  // top of middle rung
  0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

  // right of middle rung
  0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

  // bottom of middle rung.
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

  // right of bottom
  0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

  // bottom
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

  // left side
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
]

let animate: any
let gui: dat.GUI | undefined = undefined
export const initTextureFrameBuffer = (gl: WebGL2RenderingContext) => {
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    TextureShader.vertexShaderSource,
    TextureShader.fragmentShaderSource,
  ])

  const planeArrays = {
    position: {
      numComponents: 3,
      data: planePosition,
    },
    texcoord: {
      numComponents: 2,
      data: texcoordArray,
    },
  }
  const planeBufferInfo = twgl.createBufferInfoFromArrays(gl, planeArrays)

  const texture = twgl.createTexture(gl, {
    src: textureImg,
    min: gl.LINEAR,
    mag: gl.LINEAR,
  })

  let x: dat.GUIController,
    y: dat.GUIController,
    z: dat.GUIController,
    angleX: dat.GUIController,
    angleY: dat.GUIController,
    angleZ: dat.GUIController,
    scaleX: dat.GUIController,
    scaleY: dat.GUIController,
    scaleZ: dat.GUIController
  const initGui = () => {
    if (gui) return
    gui = new dat.GUI()
    let guiControls = {
      x: -150,
      y: 0,
      z: -360,
      angleX: 40,
      angleY: 25,
      angleZ: 325,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
    }
    x = gui.add(guiControls, 'x', -gl.canvas.width, gl.canvas.width, 1)
    y = gui.add(guiControls, 'y', -gl.canvas.height, gl.canvas.height, 1)
    z = gui.add(guiControls, 'z', -500, 500, 1)
    angleX = gui.add(guiControls, 'angleX', 0, 360, 1)
    angleY = gui.add(guiControls, 'angleY', 0, 360, 1)
    angleZ = gui.add(guiControls, 'angleZ', 0, 360, 1)
    scaleX = gui.add(guiControls, 'scaleX', 0, 2, 0.1)
    scaleY = gui.add(guiControls, 'scaleY', 0, 2, 0.1)
    scaleZ = gui.add(guiControls, 'scaleZ', 0, 2, 0.1)

    x.onChange((val: any) => {
      // projMtrix = twgl.m4.translate(originProjMtrix, twgl.v3.create(val, 0, 0))
    })
    y.onChange((val: any) => {
      // projMtrix = twgl.m4.translate(originProjMtrix, twgl.v3.create(0, val, 0))
    })
    angleX.onChange((val: any) => {
      // projMtrix = twgl.m4.rotateZ(originProjMtrix, val * Math.PI / 180)
    })
    scaleX.onChange((val: any) => {
      // projMtrix = twgl.m4.scale(originProjMtrix, twgl.v3.create(val, 1, 1))
    })
    scaleY.onChange((val: any) => {
      // projMtrix = twgl.m4.scale(originProjMtrix, twgl.v3.create(1, val, 1))
    })
  }
  initGui()

  const initMvp = () => {
    let projMatrix = twgl.m4.perspective(
      (60 * Math.PI) / 180,
      gl.canvas.width / gl.canvas.height,
      1,
      2000
    )

    return { projMatrix }
  }

  const render = () => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    gl.useProgram(programInfo.program)
    gl.enable(gl.DEPTH_TEST)

    let { projMatrix } = initMvp()
    let modelMatrix = twgl.m4.translation(
      twgl.v3.create(x.getValue(), y.getValue(), z.getValue())
    )
    modelMatrix = twgl.m4.rotateX(
      modelMatrix,
      (angleX.getValue() * Math.PI) / 180
    )
    modelMatrix = twgl.m4.rotateY(
      modelMatrix,
      (angleY.getValue() * Math.PI) / 180
    )
    modelMatrix = twgl.m4.rotateZ(
      modelMatrix,
      (angleZ.getValue() * Math.PI) / 180
    )
    modelMatrix = twgl.m4.scale(
      modelMatrix,
      twgl.v3.create(scaleX.getValue(), scaleY.getValue(), scaleZ.getValue())
    )
    // projMtrix = twgl.m4.translate(projMtrix, twgl.v3.create(-50, -75, -30))

    const uniforms = {
      u_projMatrix: projMatrix,
      u_modelMatrix: modelMatrix,
      u_texture: texture,
    }
    twgl.setBuffersAndAttributes(gl, programInfo, planeBufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, planeBufferInfo, gl.TRIANGLES)

    animate = requestAnimationFrame(render)
  }
  render()
}

export const clearTextureFrameBuffer = () => {
  gui && (gui.destroy(), (gui = undefined))
  cancelAnimationFrame(animate)
}
