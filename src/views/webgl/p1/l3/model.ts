import { ModelShader } from './config'
import * as twgl from 'twgl.js'
twgl.setDefaults({ attribPrefix: 'a_' })

let animate: any
/**
 * 层次模型
 * @remarks:
 * @param {WebGLRenderingContext} gl
 * @returns {*}
 */
export const initModel = (gl: WebGLRenderingContext) => {
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    ModelShader.vertexShaderSource,
    ModelShader.fragmentShaderSource,
  ])
  const arrays = {
    position: {
      numComponents: 3,
      data: [
        0.5,
        1.0,
        0.5,
        -0.5,
        1.0,
        0.5,
        -0.5,
        0.0,
        0.5,
        0.5,
        0.0,
        0.5, // v0-v1-v2-v3 front
        0.5,
        1.0,
        0.5,
        0.5,
        0.0,
        0.5,
        0.5,
        0.0,
        -0.5,
        0.5,
        1.0,
        -0.5, // v0-v3-v4-v5 right
        0.5,
        1.0,
        0.5,
        0.5,
        1.0,
        -0.5,
        -0.5,
        1.0,
        -0.5,
        -0.5,
        1.0,
        0.5, // v0-v5-v6-v1 up
        -0.5,
        1.0,
        0.5,
        -0.5,
        1.0,
        -0.5,
        -0.5,
        0.0,
        -0.5,
        -0.5,
        0.0,
        0.5, // v1-v6-v7-v2 left
        -0.5,
        0.0,
        -0.5,
        0.5,
        0.0,
        -0.5,
        0.5,
        0.0,
        0.5,
        -0.5,
        0.0,
        0.5, // v7-v4-v3-v2 down
        0.5,
        0.0,
        -0.5,
        -0.5,
        0.0,
        -0.5,
        -0.5,
        1.0,
        -0.5,
        0.5,
        1.0,
        -0.5, // v4-v7-v6-v5 back
      ],
    },
    indices: {
      numComponents: 3,
      data: [
        0,
        1,
        2,
        0,
        2,
        3, // front
        4,
        5,
        6,
        4,
        6,
        7, // right
        8,
        9,
        10,
        8,
        10,
        11, // up
        12,
        13,
        14,
        12,
        14,
        15, // left
        16,
        17,
        18,
        16,
        18,
        19, // down
        20,
        21,
        22,
        20,
        22,
        23, // back
      ],
    },
    normal: {
      numComponents: 3,
      data: [
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0, // v0-v1-v2-v3 front
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0, // v0-v3-v4-v5 right
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0, // v0-v5-v6-v1 up
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0, // v1-v6-v7-v2 left
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0, // v7-v4-v3-v2 down
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0, // v4-v7-v6-v5 back
      ],
    },
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

  let eyeX = 20,
    eyeY = 10,
    eyeZ = 30
  const model = {
    arm1_jointAngle: 0.0,
    arm2_jointAngle: 0.0,
    palm_jointAngle: 0.0,
    finger1_jointAngle: 0.0,
    finger2_jointAngle: 0.0,
    angleStep: 3.0,
  }
  document.onkeydown = (ev) => {
    switch (ev.keyCode) {
      case 38: //up
        if (model.arm2_jointAngle < 135.0) {
          model.arm2_jointAngle += model.angleStep
        }
        break
      case 40: //down
        if (model.arm2_jointAngle > -135.0) {
          model.arm2_jointAngle -= model.angleStep
        }
        break
      case 37: //left
        model.arm1_jointAngle = (model.arm1_jointAngle - model.angleStep) % 360
        break
      case 39: //right
        model.arm1_jointAngle = (model.arm1_jointAngle + model.angleStep) % 360
        break
      case 65: //a
        model.palm_jointAngle = (model.palm_jointAngle - model.angleStep) % 360
        break
      case 68: //d
        model.palm_jointAngle = (model.palm_jointAngle + model.angleStep) % 360
        break
      case 87: //w
        if (model.finger1_jointAngle < 60.0) {
          model.finger1_jointAngle += model.angleStep
          model.finger2_jointAngle = -model.finger1_jointAngle
        }
        break
      case 83: //s
        if (model.finger1_jointAngle > -60.0) {
          model.finger1_jointAngle -= model.angleStep
          model.finger2_jointAngle = -model.finger1_jointAngle
        }
        break
      default:
        return
    }

    console.log(model, '-------')
    render()
  }

  const uniforms = {
    u_mvpMatrix: twgl.m4.identity(),
    u_light: twgl.v3.create(1, 1, 1),
    u_lightDir: twgl.v3.normalize(twgl.v3.create(0.5, 3, 4)),
    u_ambient: twgl.v3.create(0.2, 0.2, 0.2),
    u_normalMatrix: twgl.m4.identity(),
  }
  let modelMatrix = twgl.m4.identity()
  let viewMatrix = twgl.m4.inverse(
    twgl.m4.lookAt(
      twgl.v3.create(eyeX, eyeY, eyeZ),
      twgl.v3.create(0, 0, 0),
      twgl.v3.create(0, 1, 0)
    )
  )
  let projMatrix = twgl.m4.perspective((60 * Math.PI) / 180, 1, 1, 100)
  const mvpMat = {
    modelMatrix,
    viewMatrix,
    projMatrix,
    mvpMatrix: twgl.m4.multiply(
      projMatrix,
      twgl.m4.multiply(viewMatrix, modelMatrix)
    ),
  }

  const drawBox = (w: number, h: number, d: number) => {
    let modelMatrix = twgl.m4.scale(mvpMat.modelMatrix, twgl.v3.create(w, h, d))
    mvpMat.mvpMatrix = twgl.m4.multiply(
      mvpMat.projMatrix,
      twgl.m4.multiply(mvpMat.viewMatrix, modelMatrix)
    )

    uniforms.u_mvpMatrix = mvpMat.mvpMatrix
    uniforms.u_normalMatrix = twgl.m4.transpose(twgl.m4.inverse(modelMatrix))

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)
  }

  const computeRotate = (angle: number) => {
    return angle * Math.PI / 180
  }

  const render = () => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    let baseHeight = 2
    mvpMat.modelMatrix = twgl.m4.translation(
      twgl.v3.create(0, -12, 0)
    )
    drawBox(10.0, baseHeight, 10.0)

    let arm1Length = 10.0
    mvpMat.modelMatrix = twgl.m4.translate(
      mvpMat.modelMatrix,
      twgl.v3.create(0.0, baseHeight, 0.0)
    )
    mvpMat.modelMatrix = twgl.m4.axisRotate(
      mvpMat.modelMatrix,
      twgl.v3.create(0.0, 1.0, 0.0),
      computeRotate(model.arm1_jointAngle)
    )
    drawBox(3.0, arm1Length, 3.0)

    //arm2
    let arm2Length = 10.0
    mvpMat.modelMatrix = twgl.m4.translate(
      mvpMat.modelMatrix,
      twgl.v3.create(0.0, arm1Length, 0.0)
    )
    mvpMat.modelMatrix = twgl.m4.axisRotate(
      mvpMat.modelMatrix,
      twgl.v3.create(0.0, 0.0, 1.0),
      computeRotate(model.arm2_jointAngle)
    )
    drawBox(4.0, arm2Length, 4.0)

    //palm
    let palmLength = 2.0
    mvpMat.modelMatrix = twgl.m4.translate(
      mvpMat.modelMatrix,
      twgl.v3.create(0.0, arm2Length, 0.0)
    )
    mvpMat.modelMatrix = twgl.m4.axisRotate(
      mvpMat.modelMatrix,
      twgl.v3.create(0.0, 1.0, 0.0),
      computeRotate(model.palm_jointAngle)
    )
    drawBox(2.0, palmLength, 6.0)

    mvpMat.modelMatrix = twgl.m4.translate(
      mvpMat.modelMatrix,
      twgl.v3.create(0.0, palmLength, 0.0)
    )

    let modelMatrix = mvpMat.modelMatrix
    mvpMat.modelMatrix = twgl.m4.translate(
      mvpMat.modelMatrix,
      twgl.v3.create(0.0, 0.0, 2.0)
    )
    mvpMat.modelMatrix = twgl.m4.axisRotate(
      mvpMat.modelMatrix,
      twgl.v3.create(1.0, 0.0, 0.0),
      computeRotate(model.finger1_jointAngle)
    )
    drawBox(1.0, 2.0, 1.0)

    mvpMat.modelMatrix = modelMatrix
    mvpMat.modelMatrix = twgl.m4.translate(
      mvpMat.modelMatrix,
      twgl.v3.create(0.0, 0.0, -2.0)
    )
    mvpMat.modelMatrix = twgl.m4.axisRotate(
      mvpMat.modelMatrix,
      twgl.v3.create(1.0, 0.0, 0.0),
      computeRotate(model.finger2_jointAngle)
    )
    drawBox(1.0, 2.0, 1.0)

    // animate = requestAnimationFrame(render)
  }
  render()
}

export const clearModel = () => {
  cancelAnimationFrame(animate)
}
