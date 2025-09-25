import { cubeColor, cubeIndices, cubeNormal, cubePosition, FogShader, initHelpLine } from './config'
import * as twgl from 'twgl.js'
twgl.setDefaults({ attribPrefix: 'a_' })

let animate: any
export const initFog = (gl: WebGLRenderingContext) => {
  const { drawHelpLine } = initHelpLine(gl)
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    FogShader.vertexShaderSource,
    FogShader.fragmentShaderSource,
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

  let eye = [25, 65, 35], fogDist = [50, 80], fogColor = [0.137, 0.231, 0.423], rotateZ = 30
  document.onkeydown = ev => {
    switch (ev.keyCode) {
      case 38:
        fogDist[1] += 1;
        break;
      case 40:
        if (fogDist[1] > fogDist[0]) fogDist[1] -= 1;
        break;
      case 39:
        rotateZ += 5
        break;
      case 37:
        rotateZ -= 5
        break;

      default:
        break;
    }

    render()
  }

  gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0)
  const render = () => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    let viewMatrix = twgl.m4.lookAt(twgl.v3.create(eye[0], eye[1], eye[2]), twgl.v3.create(0, 0, 0), twgl.v3.create(0, 1, 0))
    viewMatrix = twgl.m4.inverse(viewMatrix)

    let modelMatrix = twgl.m4.translation(twgl.v3.create(0, 0, 0))
    modelMatrix = twgl.m4.scale(modelMatrix, twgl.v3.create(10, 10, 10))
    modelMatrix = twgl.m4.rotateZ(modelMatrix, rotateZ * Math.PI / 180)

    // let projMatrix = twgl.m4.ortho(-1.0, 1.0, -1.0, 1.0, 0, 10)
    let projMatrix = twgl.m4.perspective(60 * Math.PI / 180, 1, 1, 100)

    let mvpMatrix = twgl.m4.multiply(projMatrix, twgl.m4.multiply(viewMatrix, modelMatrix))

    drawHelpLine(mvpMatrix)

    const uniforms = {
      u_modelMatrix: modelMatrix,
      u_mvpMatrix: mvpMatrix,
      u_eye: eye,
      u_fogColor: fogColor,
      u_fogDist: fogDist
    }

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)


    // animate = requestAnimationFrame(render)
  }
  render()
}

export const clearFog = () => {
  cancelAnimationFrame(animate)
}