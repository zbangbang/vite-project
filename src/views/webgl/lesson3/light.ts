import { LightShader, PointLightShader } from './config'
import * as twgl from 'twgl.js'
import { initHelpLine } from './config'
twgl.setDefaults({ attribPrefix: 'a_' })

let animate: any
/**
 * 平行光
 * @remarks:
 * @param {WebGLRenderingContext} gl
 * @returns {*}
 */
export const initLight = (gl: WebGLRenderingContext) => {
  const helpLine = initHelpLine(gl)

  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    LightShader.vertexShaderSource,
    LightShader.fragmentShaderSource,
  ])
  const arrays = {
    position: {
      numComponents: 3,
      data: [
        // 前
        1, 1, 1,
        -1, 1, 1,
        -1, 1, -1,
        1, 1, -1,
        // 右
        1, 1, 1,
        1, -1, 1,
        1, -1, -1,
        1, 1, -1,
        // 上
        1, 1, 1,
        -1, 1, 1,
        -1, -1, 1,
        1, -1, 1,
        // 后
        -1, -1, -1,
        1, -1, -1,
        1, -1, 1,
        -1, -1, 1,
        // 左
        -1, -1, -1,
        -1, -1, 1,
        -1, 1, 1,
        -1, 1, -1,
        // 下
        -1, -1, -1,
        1, -1, -1,
        1, 1, -1,
        -1, 1, -1,
      ],
    },
    indices: {
      numComponents: 3,
      data: [
        // 前
        0, 1, 2,
        0, 2, 3,
        // 右
        4, 5, 6,
        4, 6, 7,
        // 上
        8, 9, 10,
        8, 10, 11,
        // 后
        12, 13, 14,
        12, 14, 15,
        // 左
        16, 17, 18,
        16, 18, 19,
        // 下
        20, 21, 22,
        20, 22, 23
      ]
    },
    color: {
      numComponents: 3,
      data: [
        // 前
        0.5, 0.5, 1,
        0.5, 0.5, 1,
        0.5, 0.5, 1,
        0.5, 0.5, 1,
        // 右
        0.5, 1, 0.5,
        0.5, 1, 0.5,
        0.5, 1, 0.5,
        0.5, 1, 0.5,
        // 上
        1, 0.5, 0.5,
        1, 0.5, 0.5,
        1, 0.5, 0.5,
        1, 0.5, 0.5,
        // 后
        0.5, 1, 1,
        0.5, 1, 1,
        0.5, 1, 1,
        0.5, 1, 1,
        // 左
        1, 0.5, 1,
        1, 0.5, 1,
        1, 0.5, 1,
        1, 0.5, 1,
        // 下
        1, 1, 0.5,
        1, 1, 0.5,
        1, 1, 0.5,
        1, 1, 0.5,
      ],
    },
    normal: {
      numComponents: 3,
      data: [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
      ]
    }
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

  let eyeX = 2, eyeY = 3, eyeZ = 7, mx = 0, my = 0, mz = 0
  let modelMatrix = twgl.m4.translation(twgl.v3.create(mx, my, mz))
  let r = 15 * Math.PI / 180
  document.onkeydown = ev => {
    console.log(ev);
    // 左
    if (ev.keyCode == 37) {
      modelMatrix = twgl.m4.rotateZ(modelMatrix, r)
    }
    // 右
    if (ev.keyCode == 39) {
      modelMatrix = twgl.m4.rotateZ(modelMatrix, -r)
    }
    // 上
    if (ev.keyCode == 38) {
      modelMatrix = twgl.m4.rotateX(modelMatrix, -r)
    }
    // 下
    if (ev.keyCode == 40) {
      modelMatrix = twgl.m4.rotateX(modelMatrix, r)
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

    // let projMatrix = twgl.m4.ortho(-1.0, 1.0, -1.0, 1.0, 0, 10)
    let projMatrix = twgl.m4.perspective(30, 1, 1, 100)

    let mvpMatrix = twgl.m4.multiply(projMatrix, twgl.m4.multiply(viewMatrix, modelMatrix))

    const uniforms = {
      u_mvpMatrix: mvpMatrix,
      u_light: twgl.v3.create(1, 1, 1),
      u_lightDir: twgl.v3.normalize(twgl.v3.create(0.5, 3, 4)),
      u_ambient: twgl.v3.create(0.2, 0.2, 0.2),
      u_normalMatrix: twgl.m4.transpose(twgl.m4.inverse(modelMatrix))
    }

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)


    // animate = requestAnimationFrame(render)
  }
  render()
}

/**
 * 点光源
 * @remarks:
 * @param {WebGLRenderingContext} gl
 * @returns {*}
 */
export const initPointLight = (gl: WebGLRenderingContext) => {
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    PointLightShader.vertexShaderSource,
    PointLightShader.fragmentShaderSource,
  ])
  const arrays = {
    position: {
      numComponents: 3,
      data: [
        // 前
        1, 1, 1,
        -1, 1, 1,
        -1, 1, -1,
        1, 1, -1,
        // 右
        1, 1, 1,
        1, -1, 1,
        1, -1, -1,
        1, 1, -1,
        // 上
        1, 1, 1,
        -1, 1, 1,
        -1, -1, 1,
        1, -1, 1,
        // 后
        -1, -1, -1,
        1, -1, -1,
        1, -1, 1,
        -1, -1, 1,
        // 左
        -1, -1, -1,
        -1, -1, 1,
        -1, 1, 1,
        -1, 1, -1,
        // 下
        -1, -1, -1,
        1, -1, -1,
        1, 1, -1,
        -1, 1, -1,
      ],
    },
    indices: {
      numComponents: 3,
      data: [
        // 前
        0, 1, 2,
        0, 2, 3,
        // 右
        4, 5, 6,
        4, 6, 7,
        // 上
        8, 9, 10,
        8, 10, 11,
        // 后
        12, 13, 14,
        12, 14, 15,
        // 左
        16, 17, 18,
        16, 18, 19,
        // 下
        20, 21, 22,
        20, 22, 23
      ]
    },
    color: {
      numComponents: 3,
      data: [
        // 前
        0.5, 0.5, 1,
        0.5, 0.5, 1,
        0.5, 0.5, 1,
        0.5, 0.5, 1,
        // 右
        0.5, 1, 0.5,
        0.5, 1, 0.5,
        0.5, 1, 0.5,
        0.5, 1, 0.5,
        // 上
        1, 0.5, 0.5,
        1, 0.5, 0.5,
        1, 0.5, 0.5,
        1, 0.5, 0.5,
        // 后
        0.5, 1, 1,
        0.5, 1, 1,
        0.5, 1, 1,
        0.5, 1, 1,
        // 左
        1, 0.5, 1,
        1, 0.5, 1,
        1, 0.5, 1,
        1, 0.5, 1,
        // 下
        1, 1, 0.5,
        1, 1, 0.5,
        1, 1, 0.5,
        1, 1, 0.5,
      ],
    },
    normal: {
      numComponents: 3,
      data: [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
      ]
    }
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

  let eyeX = 2, eyeY = 3, eyeZ = 7, mx = 0, my = 0, mz = 0
  let modelMatrix = twgl.m4.translation(twgl.v3.create(mx, my, mz))
  let r = 15 * Math.PI / 180
  document.onkeydown = ev => {
    console.log(ev);
    // 左
    if (ev.keyCode == 37) {
      modelMatrix = twgl.m4.rotateZ(modelMatrix, r)
    }
    // 右
    if (ev.keyCode == 39) {
      modelMatrix = twgl.m4.rotateZ(modelMatrix, -r)
    }
    // 上
    if (ev.keyCode == 38) {
      modelMatrix = twgl.m4.rotateX(modelMatrix, -r)
    }
    // 下
    if (ev.keyCode == 40) {
      modelMatrix = twgl.m4.rotateX(modelMatrix, r)
    }

    // render()
  }

  const render = () => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    let viewMatrix = twgl.m4.lookAt(twgl.v3.create(eyeX, eyeY, eyeZ), twgl.v3.create(0, 0, 0), twgl.v3.create(0, 1, 0))
    viewMatrix = twgl.m4.inverse(viewMatrix)

    // let projMatrix = twgl.m4.ortho(-1.0, 1.0, -1.0, 1.0, 0, 10)
    let projMatrix = twgl.m4.perspective(30, 1, 1, 100)

    let mvpMatrix = twgl.m4.multiply(projMatrix, twgl.m4.multiply(viewMatrix, modelMatrix))

    const uniforms = {
      u_modelMatrix: modelMatrix,
      u_mvpMatrix: mvpMatrix,
      u_light: twgl.v3.create(1, 1, 1),
      u_lightPos: twgl.v3.create(-2, 5, 7),
      u_ambient: twgl.v3.create(0.2, 0.2, 0.2),
      u_normalMatrix: twgl.m4.transpose(twgl.m4.inverse(modelMatrix))
    }

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)


    animate = requestAnimationFrame(render)
  }
  render()
}

export const clearLight = () => {
  cancelAnimationFrame(animate)
}