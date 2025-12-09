import { TextureShader } from './config'
import testImg from '@/assets/images/tex.png'
import testImg1 from '@/assets/images/typhoon/typhoon.png'
import * as twgl from 'twgl.js'
twgl.setDefaults({ attribPrefix: 'a_' })

let animate: any
export const initTexture = (gl: WebGLRenderingContext) => {
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    TextureShader.vertexShaderSource,
    TextureShader.fragmentShaderSource,
  ])
  const arrays = {
    position: {
      numComponents: 3,
      data: [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0],
    },
    color: {
      numComponents: 3,
      data: [1.0, 0, 0, 0, 1.0, 0, 0, 0, 1.0, 0, 0, 0],
    },
    texCoord: {
      numComponents: 2,
      data: [0.25, 1.75, 1.75, 1.75, 0.25, 0.25, 1.75, 0.25],
    },
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
  const textures = twgl.createTextures(gl, {
    t1: {
      src: testImg,
      min: gl.LINEAR,
      mag: gl.LINEAR,
      // wrapS: gl.CLAMP_TO_EDGE,
      // wrapT: gl.CLAMP_TO_EDGE,
      // flipY: 0,
    },
    t2: {
      src: testImg1,
      min: gl.LINEAR,
      mag: gl.LINEAR,
      // wrapS: gl.CLAMP_TO_EDGE,
      // wrapT: gl.CLAMP_TO_EDGE,
      // flipY: 0,
    },
  })

  const render = () => {
    // twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    // let m4 = twgl.m4.translation(twgl.v3.create(0.5, 0, 0))
    // m4 = twgl.m4.axisRotate(m4, twgl.v3.create(0, 0, 1), 60)
    let m4 = twgl.m4.axisRotation(twgl.v3.create(0, 0, 1), 0)
    m4 = twgl.m4.translate(m4, twgl.v3.create(0, 0, 0))
    const uniforms = {
      u_matrix: m4,
      u_sampler: textures.t1,
      u_sampler1: textures.t2,
    }

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP)

    animate = requestAnimationFrame(render)
  }
  render()
}

export const clearTexture = () => {
  cancelAnimationFrame(animate)
}