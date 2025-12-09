import { ViewMatrixShader } from './config'
import * as twgl from 'twgl.js'
twgl.setDefaults({ attribPrefix: 'a_' })

let animate: any
export const initViewMatrix = (gl: WebGLRenderingContext) => {
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    ViewMatrixShader.vertexShaderSource,
    ViewMatrixShader.fragmentShaderSource,
  ])
  const arrays = {
    position: {
      numComponents: 3,
      data: [
        0.0, -1, 0.1,
        -0.5, 1, 0.1,
        0.5, 1, 0.1
      ],
    },
    color: {
      numComponents: 4,
      data: [
        1.0, 1, 0, 0.3,
        1.0, 1.0, 0, 0.3,
        1.0, 1.0, 0, 0.3,
      ],
    },
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

  const arrays1 = {
    position: {
      numComponents: 3,
      data: [
        0.0, -1.2, 0,
        -0.7, 1.2, 0,
        0.7, 1.2, 0,
      ],
    },
    color: {
      numComponents: 4,
      data: [
        0.4, 1.0, 0.4, 1,
        0.4, 1.0, 0.4, 1,
        0.4, 1, 0.4, 1,
      ],
    },
  }
  const bufferInfo1 = twgl.createBufferInfoFromArrays(gl, arrays1)

  let eyeX = 0, eyeY = 0, eyeZ = 5, z1 = 0
  document.onkeydown = ev => {
    console.log(ev);
    if (ev.keyCode == 39) {
      // eyeX += 0.1
      z1 += 0.1
    }
    if (ev.keyCode == 37) {
      // eyeX -= 0.1
      z1 -= 0.1
    }

    render()
  }

  const render = () => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
    gl.enable(gl.POLYGON_OFFSET_FILL)

    let viewMatrix = twgl.m4.lookAt(twgl.v3.create(eyeX, eyeY, eyeZ), twgl.v3.create(0, 0, -100), twgl.v3.create(0, 1, 0))
    viewMatrix = twgl.m4.inverse(viewMatrix)

    let modelMatrix = twgl.m4.translation(twgl.v3.create(0.75, 0, z1))

    // let projMatrix = twgl.m4.ortho(-1.0, 1.0, -1.0, 1.0, 0, 10)
    let projMatrix = twgl.m4.perspective(30, 1, 1, 100)

    let mvpMatrix = twgl.m4.multiply(projMatrix, twgl.m4.multiply(viewMatrix, modelMatrix))

    const uniforms = {
      u_mvpMatrix: mvpMatrix
    }
    const uniforms1 = {
      u_mvpMatrix: mvpMatrix
    }

    gl.useProgram(programInfo.program)

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo1)
    twgl.setUniforms(programInfo, uniforms1)
    twgl.drawBufferInfo(gl, bufferInfo1, gl.TRIANGLES)

    gl.depthMask(false)
    gl.polygonOffset(10000.0, 1.0)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)
    gl.depthMask(true)


    // animate = requestAnimationFrame(render)
  }
  render()
}

export const clearViewMatrix = () => {
  cancelAnimationFrame(animate)
}