/*
 * @FilePath: frameBuffer.ts
 * @Author: @zhangl
 * @Date: 2025-08-11 14:46:58
 * @LastEditTime: 2026-01-09 15:45:35
 * @LastEditors: @zhangl
 * @Description: 渲染到纹理
 */
import { FrameBufferShader, initHelpLine } from './config'
import * as twgl from 'twgl.js'
import skyImg from '@/assets/images/webgl/sky_cloud.jpg'
import { TextureFrameBufferShader } from './config'
twgl.setDefaults({ attribPrefix: 'a_' })

const planePosition = [
  1.0,
  1.0,
  0.0,
  -1.0,
  1.0,
  0.0,
  -1.0,
  -1.0,
  0.0,
  1.0,
  -1.0,
  0.0, // v0-v1-v2-v3
]
const planeTexCoords = [1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]
const planeIndices = [0, 1, 2, 0, 2, 3]
const kernels = {
  normal: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  gaussianBlur: [0.045, 0.122, 0.045, 0.122, 0.332, 0.122, 0.045, 0.122, 0.045],
  gaussianBlur2: [1, 2, 1, 2, 4, 2, 1, 2, 1],
  gaussianBlur3: [0, 1, 0, 1, 1, 1, 0, 1, 0],
  unsharpen: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
  sharpness: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  sharpen: [-1, -1, -1, -1, 16, -1, -1, -1, -1],
  edgeDetect: [
    -0.125, -0.125, -0.125, -0.125, 1, -0.125, -0.125, -0.125, -0.125,
  ],
  edgeDetect2: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
  edgeDetect3: [-5, 0, 0, 0, 0, 0, 0, 0, 5],
  edgeDetect4: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
  edgeDetect5: [-1, -1, -1, 2, 2, 2, -1, -1, -1],
  edgeDetect6: [-5, -5, -5, -5, 39, -5, -5, -5, -5],
  sobelHorizontal: [1, 2, 1, 0, 0, 0, -1, -2, -1],
  sobelVertical: [1, 0, -1, 2, 0, -2, 1, 0, -1],
  previtHorizontal: [1, 1, 1, 0, 0, 0, -1, -1, -1],
  previtVertical: [1, 0, -1, 1, 0, -1, 1, 0, -1],
  boxBlur: [0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111],
  triangleBlur: [
    0.0625, 0.125, 0.0625, 0.125, 0.25, 0.125, 0.0625, 0.125, 0.0625,
  ],
  emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
}

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
      data: planeIndices,
    },
    texCoord: {
      numComponents: 2,
      data: planeTexCoords,
    },
  }
  const planeBufferInfo = twgl.createBufferInfoFromArrays(gl, planeArrays)

  let textureProgramInfo: any
  textureProgramInfo = twgl.createProgramInfo(gl, [
    TextureFrameBufferShader.vertexShaderSource,
    TextureFrameBufferShader.fragmentShaderSource,
  ])
  const textureArrays = {
    position: {
      numComponents: 3,
      data: planePosition,
    },
    indices: {
      numComponents: 3,
      data: planeIndices,
    },
    texCoord: {
      numComponents: 2,
      data: planeTexCoords,
    },
  }
  const textureBufferInfo = twgl.createBufferInfoFromArrays(gl, textureArrays)

  const texture = twgl.createTexture(gl, {
    src: skyImg,
    min: gl.LINEAR,
    mag: gl.LINEAR,
    // wrapS: gl.CLAMP_TO_EDGE,
    // wrapT: gl.CLAMP_TO_EDGE,
    // flipY: 0,
  })

  let fbo1 = twgl.createFramebufferInfo(gl, undefined, 256, 256)
  let fbo2 = twgl.createFramebufferInfo(gl, undefined, 256, 256)

  const initMvp = (eyeX = 0, eyeY = 0, eyeZ = 6) => {
    let viewMatrix = twgl.m4.lookAt(
      twgl.v3.create(eyeX, eyeY, eyeZ),
      twgl.v3.create(0, 0, 0),
      twgl.v3.create(0, 1, 0)
    )
    viewMatrix = twgl.m4.inverse(viewMatrix)

    let modelMatrix = twgl.m4.translation(twgl.v3.create(0, 0, 0))

    // let projMatrix = twgl.m4.ortho(-1.0, 1.0, -1.0, 1.0, 0, 10)
    let projMatrix = twgl.m4.perspective((60 * Math.PI) / 180, 1, 1, 100)

    let mvpMatrix = twgl.m4.multiply(
      projMatrix,
      twgl.m4.multiply(viewMatrix, modelMatrix)
    )

    return mvpMatrix
  }

  const computeKernelWeight = (kernel: any[]) => {
    let weight = kernel.reduce(function (prev, curr) {
      return prev + curr
    })
    return weight <= 0 ? 1 : weight
  }

  let fboMvpMatrix = initMvp()
  let mvpMatrix = initMvp(1, 1, 2)

  const u_kernels = [kernels.gaussianBlur, kernels.unsharpen, kernels.sharpness]
  let currentTexture: any = texture

  const render = () => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    // gl.enable(gl.DEPTH_TEST)
    // gl.enable(gl.CULL_FACE)
    gl.useProgram(textureProgramInfo.program)

    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    let weight,
      currentFboIndex = 0,
      fbo

    twgl.bindFramebufferInfo(gl, fbo1)
    weight = computeKernelWeight(kernels.normal)
    const textureUniforms = {
      u_sampler: texture,
      u_kernel: kernels.normal,
      u_kernelWeight: weight,
    }
    twgl.setBuffersAndAttributes(gl, textureProgramInfo, textureBufferInfo)
    twgl.setUniforms(textureProgramInfo, textureUniforms)
    twgl.drawBufferInfo(gl, textureBufferInfo, gl.TRIANGLES)

    let temp
    u_kernels.forEach((item, index) => {
      twgl.bindFramebufferInfo(gl, fbo2)

      // gl.clearColor(0.2, 0.2, 0.4, 1.0)
      // gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

      weight = computeKernelWeight(item)
      const textureUniforms = {
        u_sampler: fbo1.attachments[0],
        u_kernel: item,
        u_kernelWeight: weight,
      }
      twgl.setBuffersAndAttributes(gl, textureProgramInfo, textureBufferInfo)
      twgl.setUniforms(textureProgramInfo, textureUniforms)
      twgl.drawBufferInfo(gl, textureBufferInfo, gl.TRIANGLES)

      temp = fbo1
      fbo1 = fbo2
      fbo2 = temp
    })

    gl.useProgram(programInfo.program)
    twgl.bindFramebufferInfo(gl, null)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    // gl.clearColor(0.0, 0.0, 0.0, 1.0)
    // gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    const uniforms = {
      u_mvpMatrix: mvpMatrix,
      u_sampler: fbo1.attachments[0],
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
