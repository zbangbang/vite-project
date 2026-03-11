/*
 * @FilePath: textureCube.ts
 * @Author: @zhangl
 * @Date: 2025-08-11 14:46:58
 * @LastEditTime: 2026-01-16 16:27:11
 * @LastEditors: @zhangl
 * @Description: 立方体纹理贴图
 */
import * as twgl from 'twgl.js'
import { TextureShader } from './config'
twgl.setDefaults({ attribPrefix: 'a_' })
import dat from 'dat.gui'
import textureImg from '@/assets/images/webgl/noodles.jpg'

const planePosition = [
  30, 30, 30,
  30, 150, 30,
  150, 30, 30,
  30, 150, 30,
  150, 150, 30,
  150, 30, 30,

  30, 30, 150,
  150, 30, 150,
  30, 150, 150,
  30, 150, 150,
  150, 30, 150,
  150, 150, 150,

  30, 150, 30,
  30, 150, 150,
  150, 150, 30,
  30, 150, 150,
  150, 150, 150,
  150, 150, 30,

  30, 30, 30,
  150, 30, 30,
  30, 30, 150,
  30, 30, 150,
  150, 30, 30,
  150, 30, 150,

  30, 30, 30,
  30, 30, 150,
  30, 150, 30,
  30, 30, 150,
  30, 150, 150,
  30, 150, 30,

  150, 30, 30,
  150, 150, 30,
  150, 30, 150,
  150, 30, 150,
  150, 150, 30,
  150, 150, 150,
]

const texcoordArray = [
  // 选择左上图
  0, 0,
  0, 0.5,
  0.25, 0,
  0, 0.5,
  0.25, 0.5,
  0.25, 0,
  // 选择中上图
  0.25, 0,
  0.5, 0,
  0.25, 0.5,
  0.25, 0.5,
  0.5, 0,
  0.5, 0.5,
  // 选择右上图
  0.5, 0,
  0.5, 0.5,
  0.75, 0,
  0.5, 0.5,
  0.75, 0.5,
  0.75, 0,
  // 选择左下图
  0, 0.5,
  0.25, 0.5,
  0, 1,
  0, 1,
  0.25, 0.5,
  0.25, 1,
  // 选择中下图
  0.25, 0.5,
  0.25, 1,
  0.5, 0.5,
  0.25, 1,
  0.5, 1,
  0.5, 0.5,
  // 选择右下图
  0.5, 0.5,
  0.75, 0.5,
  0.5, 1,
  0.5, 1,
  0.75, 0.5,
  0.75, 1,
]

let animate: any
let gui: dat.GUI | undefined = undefined
export const initTextureCubeFrameBuffer = (gl: WebGL2RenderingContext) => {
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
  const VAO = twgl.createVAOFromBufferInfo(gl, programInfo, planeBufferInfo)

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
    rotateX: dat.GUIController,
    rotateY: dat.GUIController,
    rotateZ: dat.GUIController,
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
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
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
    rotateX = gui.add(guiControls, 'rotateX', 0, 360, 1)
    rotateY = gui.add(guiControls, 'rotateY', 0, 360, 1)
    rotateZ = gui.add(guiControls, 'rotateZ', 0, 360, 1)
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

    // 绕自身轴旋转
    modelMatrix = twgl.m4.translate(modelMatrix, twgl.v3.create(90, 90, 90))
    let rotateMatrix = twgl.m4.rotationX(rotateX.getValue() * Math.PI / 180)
    rotateMatrix = twgl.m4.rotateY(rotateMatrix, rotateY.getValue() * Math.PI / 180)
    rotateMatrix = twgl.m4.rotateZ(rotateMatrix, rotateZ.getValue() * Math.PI / 180)
    modelMatrix = twgl.m4.multiply(modelMatrix, rotateMatrix)
    modelMatrix = twgl.m4.translate(modelMatrix, twgl.v3.create(-90, -90, -90))

    const uniforms = {
      u_projMatrix: projMatrix,
      u_modelMatrix: modelMatrix,
      u_texture: texture,
    }
    // twgl.setBuffersAndAttributes(gl, programInfo, planeBufferInfo)
    gl.bindVertexArray(VAO)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, planeBufferInfo, gl.TRIANGLES)

    animate = requestAnimationFrame(render)
  }
  render()
}

export const clearTextureCubeFrameBuffer = () => {
  gui && (gui.destroy(), (gui = undefined))
  cancelAnimationFrame(animate)
}
