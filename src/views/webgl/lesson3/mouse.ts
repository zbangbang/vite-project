import { MouseShader } from './config'
import * as twgl from 'twgl.js'
twgl.setDefaults({ attribPrefix: 'a_' })

let animate: any
/**
 * 平行光
 * @remarks:
 * @param {WebGLRenderingContext} gl
 * @returns {*}
 */
export const initMouse = (gl: WebGLRenderingContext, canvas: HTMLCanvasElement) => {
  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    MouseShader.vertexShaderSource,
    MouseShader.fragmentShaderSource,
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
    face: {
      numComponents: 1,
      data: [
        1, 1, 1, 1,
        2, 2, 2, 2,
        3, 3, 3, 3,
        4, 4, 4, 4,
        5, 5, 5, 5,
        6, 6, 6, 6
      ]
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
  }

  let dragging = false
  let lastX = 0, lastY = 0, x = 0, y = 0
  let currentAngle = {
    x: 0,
    y: 0
  }
  canvas.onmousedown = (e: MouseEvent) => {
    x = e.clientX
    y = e.clientY
    let rect = (e.target! as HTMLCanvasElement).getBoundingClientRect()

    if (rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y) {
      lastX = x
      lastY = y
      dragging = true

      check(x - rect.left, rect.bottom - y)
    }
  }
  canvas.onmouseup = e => {
    dragging = false
  }
  canvas.onmousemove = e => {
    x = e.clientX
    y = e.clientY
    if (dragging) {
      let factor = 100 / canvas.height
      let dx = factor * (x - lastX)
      let dy = factor * (y - lastY)

      currentAngle.x = currentAngle.x + dx
      currentAngle.y = currentAngle.y + dy
    }
    lastX = x
    lastY = y
  }

  const check = (x: number, y: number) => {
    uniforms.u_click = 0
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)

    let color = new Uint8Array(4)
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color)

    uniforms.u_click = color[3]
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)
  }

  let uniforms = {
    u_mvpMatrix: twgl.m4.identity(),
    u_light: twgl.v3.create(1, 1, 1),
    u_lightDir: twgl.v3.normalize(twgl.v3.create(0.5, 3, 4)),
    u_ambient: twgl.v3.create(0.2, 0.2, 0.2),
    u_normalMatrix: twgl.m4.transpose(twgl.m4.inverse(modelMatrix)),
    u_click: -1
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)
  const render = () => {
    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    let viewMatrix = twgl.m4.lookAt(twgl.v3.create(eyeX, eyeY, eyeZ), twgl.v3.create(0, 0, 0), twgl.v3.create(0, 1, 0))
    viewMatrix = twgl.m4.inverse(viewMatrix)

    // let projMatrix = twgl.m4.ortho(-1.0, 1.0, -1.0, 1.0, 0, 10)
    let projMatrix = twgl.m4.perspective(60 * Math.PI / 180, 1, 1, 100)

    let mvpMatrix = twgl.m4.multiply(projMatrix, twgl.m4.multiply(viewMatrix, modelMatrix))
    mvpMatrix = twgl.m4.rotateX(mvpMatrix, currentAngle.y * Math.PI / 180)
    mvpMatrix = twgl.m4.rotateY(mvpMatrix, currentAngle.x * Math.PI / 180)

    uniforms.u_mvpMatrix = mvpMatrix
    uniforms.u_normalMatrix = twgl.m4.transpose(twgl.m4.inverse(modelMatrix))

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)

    animate = requestAnimationFrame(render)
  }
  render()
}

export const clearMouse = () => {
  cancelAnimationFrame(animate)
}