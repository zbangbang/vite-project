import { StencilShader } from './config'
import testImg from '@/assets/images/tex.png'
import testImg1 from '@/assets/images/typhoon/typhoon.png'
import * as twgl from 'twgl.js'
twgl.setDefaults({ attribPrefix: 'a_' })

let animate: any
export const initStencilTest = (gl: WebGLRenderingContext) => {
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    StencilShader.vertexShaderSource,
    StencilShader.fragmentShaderSource,
  ])
  const arrays = {
    position: {
      numComponents: 3,
      data: [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0],
    },
    color: {
      numComponents: 4,
      data: [1.0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    }
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

  const arrays1 = {
    position: {
      numComponents: 3,
      data: [-0.4, -0.4, 0, 0.4, -0.4, 0, -0.4, 0.4, 0],
    },
    color: {
      numComponents: 4,
      data: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    }
  }
  const bufferInfo1 = twgl.createBufferInfoFromArrays(gl, arrays1)

  const render = () => {
    // twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);


    gl.useProgram(programInfo.program)
    gl.enable(gl.STENCIL_TEST);

    gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo1)
    twgl.drawBufferInfo(gl, bufferInfo1, gl.TRIANGLES)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.stencilFunc(gl.EQUAL, 1, 0xFF);
    // gl.stencilFunc(gl.NOTEQUAL, 1, 0xFF);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)




    // animate = requestAnimationFrame(render)
  }
  render()
}

export const clearTexture = () => {
  cancelAnimationFrame(animate)
}