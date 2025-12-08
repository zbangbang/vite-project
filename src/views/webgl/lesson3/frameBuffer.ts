/*
 * @FilePath: frameBuffer.ts
 * @Author: @zhangl
 * @Date: 2025-08-11 14:46:58
 * @LastEditTime: 2025-11-21 15:07:08
 * @LastEditors: @zhangl
 * @Description: 渲染到纹理
 */
import { cubeColor, cubeIndices, cubeTexCoords, cubePosition, FrameBufferShader } from './config'
import * as twgl from 'twgl.js'
import skyImg from '@/assets/images/webgl/sky_cloud.jpg'
twgl.setDefaults({ attribPrefix: 'a_' })

const planePosition = [
  1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0    // v0-v1-v2-v3
]
const planeTexCoords = [
  1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0
]
const planeIndices = [
  0, 1, 2, 0, 2, 3
]

let animate: any
export const initFrameBuffer = (gl: WebGLRenderingContext) => {
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    FrameBufferShader.vertexShaderSource,
    FrameBufferShader.fragmentShaderSource,
  ])
  const planeArrays = {
    position: {
      numComponents: 3,
      data: planePosition,
    },
    indices: {
      numComponents: 3,
      data: planeIndices
    },
    texCoord: {
      numComponents: 2,
      data: planeTexCoords,
    }
  }
  const cubeArrays = {
    position: {
      numComponents: 3,
      data: cubePosition,
    },
    indices: {
      numComponents: 3,
      data: cubeIndices
    },
    texCoord: {
      numComponents: 2,
      data: cubeTexCoords,
    }
  }
  const planeBufferInfo = twgl.createBufferInfoFromArrays(gl, planeArrays)
  const cubeBufferInfo = twgl.createBufferInfoFromArrays(gl, cubeArrays)

  const textures = twgl.createTexture(gl, {
    src: skyImg,
    min: gl.LINEAR,
    mag: gl.LINEAR,
    // wrapS: gl.CLAMP_TO_EDGE,
    // wrapT: gl.CLAMP_TO_EDGE,
    // flipY: 0,
  })

  let angle = -0.1, angle1 = 0.05
  const fbo = twgl.createFramebufferInfo(gl, undefined, 256, 256)

  const initMvp = (eyeX = 0, eyeY = 0, eyeZ = 6) => {
    let viewMatrix = twgl.m4.lookAt(twgl.v3.create(eyeX, eyeY, eyeZ), twgl.v3.create(0, 0, 0), twgl.v3.create(0, 1, 0))
    viewMatrix = twgl.m4.inverse(viewMatrix)

    let modelMatrix = twgl.m4.translation(twgl.v3.create(0, 0, 0))

    // let projMatrix = twgl.m4.ortho(-1.0, 1.0, -1.0, 1.0, 0, 10)
    let projMatrix = twgl.m4.perspective(60 * Math.PI / 180, 1, 1, 100)

    let mvpMatrix = twgl.m4.multiply(projMatrix, twgl.m4.multiply(viewMatrix, modelMatrix))

    return mvpMatrix
  }

  let fboMvpMatrix = initMvp()
  let mvpMatrix = initMvp(2, 1, 2)

  const render = () => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.enable(gl.DEPTH_TEST)
    // gl.enable(gl.CULL_FACE)
    gl.useProgram(programInfo.program)

    twgl.bindFramebufferInfo(gl, fbo)
    gl.viewport(0, 0, 256, 256)
    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
    fboMvpMatrix = twgl.m4.rotateY(fboMvpMatrix, angle * Math.PI / 180)

    const fboUniforms = {
      u_mvpMatrix: fboMvpMatrix,
      u_sampler: textures
    }
    twgl.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo)
    twgl.setUniforms(programInfo, fboUniforms)
    twgl.drawBufferInfo(gl, cubeBufferInfo, gl.TRIANGLES)


    twgl.bindFramebufferInfo(gl, null)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    mvpMatrix = twgl.m4.rotateY(mvpMatrix, angle1 * Math.PI / 180)
    const uniforms = {
      u_mvpMatrix: mvpMatrix,
      u_sampler: fbo.attachments[0]
    }
    twgl.setBuffersAndAttributes(gl, programInfo, planeBufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, planeBufferInfo, gl.TRIANGLES)


    animate = requestAnimationFrame(render)
  }
  render()
}

export const clearFrameBuffer = () => {
  cancelAnimationFrame(animate)
}