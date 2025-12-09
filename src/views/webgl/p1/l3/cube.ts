import { cubeColor, cubeIndices, cubeNormal, cubePosition, ViewMatrixShader } from './config'
import * as twgl from 'twgl.js'
twgl.setDefaults({ attribPrefix: 'a_' })

let animate: any
export const initCube = (gl: WebGLRenderingContext) => {
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    ViewMatrixShader.vertexShaderSource,
    ViewMatrixShader.fragmentShaderSource,
  ])
  const arrays = {
    position: {
      numComponents: 3,
      data: cubePosition,
    },
    indices: {
      numComponents: 3,
      data: cubeIndices
    },
    color: {
      numComponents: 3,
      data: cubeColor,
    },
    normal: {
      numComponents: 3,
      data: cubeNormal
    }
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

  let eyeX = 2, eyeY = 3, eyeZ = 7
  document.onkeydown = ev => {
    console.log(ev);
    if (ev.keyCode == 39) {
      eyeX += 0.1
    }
    if (ev.keyCode == 37) {
      eyeX -= 0.1
    }

    render()
  }

  const render = () => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    let viewMatrix = twgl.m4.lookAt(twgl.v3.create(eyeX, eyeY, eyeZ), twgl.v3.create(0, 0, 0), twgl.v3.create(0, 1, 0))
    viewMatrix = twgl.m4.inverse(viewMatrix)

    let modelMatrix = twgl.m4.translation(twgl.v3.create(0, 0, 0))

    // let projMatrix = twgl.m4.ortho(-1.0, 1.0, -1.0, 1.0, 0, 10)
    let projMatrix = twgl.m4.perspective(60 * Math.PI / 180, 1, 1, 100)

    let mvpMatrix = twgl.m4.multiply(projMatrix, twgl.m4.multiply(viewMatrix, modelMatrix))

    const uniforms = {
      u_mvpMatrix: mvpMatrix
    }

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)


    // animate = requestAnimationFrame(render)
  }
  render()
}

export const clearCube = () => {
  cancelAnimationFrame(animate)
}