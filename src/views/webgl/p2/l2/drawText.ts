/*
 * @FilePath: drawText.ts
 * @Author: @zhangl
 * @Date: 2025-08-11 14:46:58
 * @LastEditTime: 2026-01-28 12:26:09
 * @LastEditors: @zhangl
 * @Description: 多几何体
 */
import * as twgl from 'twgl.js'
import { MultiObjectShader, TextShader } from './config'
twgl.setDefaults({ attribPrefix: 'a_' })
import dat from 'dat.gui'
import flattenedPrimitives from '@/utils/webgl'
import { cloneDeep } from 'lodash'
import fontImg from '@/assets/images/webgl/font.png'

const fontInfo = {
  letterHeight: 8,
  spaceWidth: 8,
  spacing: -1,
  textureWidth: 64,
  textureHeight: 40,
  glyphInfos: {
    a: { x: 0, y: 0, width: 8 },
    b: { x: 8, y: 0, width: 8 },
    c: { x: 16, y: 0, width: 8 },
    d: { x: 24, y: 0, width: 8 },
    e: { x: 32, y: 0, width: 8 },
    f: { x: 40, y: 0, width: 8 },
    g: { x: 48, y: 0, width: 8 },
    h: { x: 56, y: 0, width: 8 },
    i: { x: 0, y: 8, width: 8 },
    j: { x: 8, y: 8, width: 8 },
    k: { x: 16, y: 8, width: 8 },
    l: { x: 24, y: 8, width: 8 },
    m: { x: 32, y: 8, width: 8 },
    n: { x: 40, y: 8, width: 8 },
    o: { x: 48, y: 8, width: 8 },
    p: { x: 56, y: 8, width: 8 },
    q: { x: 0, y: 16, width: 8 },
    r: { x: 8, y: 16, width: 8 },
    s: { x: 16, y: 16, width: 8 },
    t: { x: 24, y: 16, width: 8 },
    u: { x: 32, y: 16, width: 8 },
    v: { x: 40, y: 16, width: 8 },
    w: { x: 48, y: 16, width: 8 },
    x: { x: 56, y: 16, width: 8 },
    y: { x: 0, y: 24, width: 8 },
    z: { x: 8, y: 24, width: 8 },
    '0': { x: 16, y: 24, width: 8 },
    '1': { x: 24, y: 24, width: 8 },
    '2': { x: 32, y: 24, width: 8 },
    '3': { x: 40, y: 24, width: 8 },
    '4': { x: 48, y: 24, width: 8 },
    '5': { x: 56, y: 24, width: 8 },
    '6': { x: 0, y: 32, width: 8 },
    '7': { x: 8, y: 32, width: 8 },
    '8': { x: 16, y: 32, width: 8 },
    '9': { x: 24, y: 32, width: 8 },
    '-': { x: 32, y: 32, width: 8 },
    '*': { x: 40, y: 32, width: 8 },
    '!': { x: 48, y: 32, width: 8 },
    '?': { x: 56, y: 32, width: 8 },
  },
}
let animate: any
let gui: dat.GUI | undefined = undefined
export const initDrawTextFrameBuffer = (gl: WebGL2RenderingContext) => {
  const canvas = document.getElementById('text-canvas') as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!

  const initMvp = () => {
    const projMatrix = twgl.m4.perspective(
      (60 * Math.PI) / 180,
      gl.canvas.width / gl.canvas.height,
      1,
      2000
    )

    const cameraMatrix = twgl.m4.lookAt(
      twgl.v3.create(0, 0, 1000),
      twgl.v3.create(0, 0, 0),
      twgl.v3.create(0, 1, 0)
    )
    const viewMatrix = twgl.m4.inverse(cameraMatrix)

    return { projMatrix, viewMatrix }
  }

  let programInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    MultiObjectShader.vertexShaderSource,
    MultiObjectShader.fragmentShaderSource,
  ])

  const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(
    gl,
    120,
    12,
    10
  )
  const sphereVAO = twgl.createVAOFromBufferInfo(
    gl,
    programInfo,
    sphereBufferInfo
  )
  const cubeBufferInfo = flattenedPrimitives.createCubeBufferInfo(gl, 8)
  const cubeVAO = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo)

  let { projMatrix, viewMatrix } = initMvp()
  const objects = [
    {
      vao: sphereVAO,
      bufferInfo: sphereBufferInfo,
      uniforms: {
        u_multiColor: [1, 0.5, 0.5, 1],
        u_mvpMatrix: twgl.m4.identity(),
      },
      translation: [0, 0, 0],
    },
    {
      vao: cubeVAO,
      bufferInfo: cubeBufferInfo,
      uniforms: {
        u_multiColor: [0.5, 1, 0.5, 1],
        u_mvpMatrix: twgl.m4.identity(),
      },
      translation: [0, 0, 0],
    },
  ]

  // 将文字放在画布中间
  const makeTextCanvas = (
    ctx: CanvasRenderingContext2D,
    text: string,
    width: number,
    height: number
  ) => {
    ctx.canvas.width = width
    ctx.canvas.height = height
    ctx.font = '16px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'white'
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillText(text, width / 2, height / 2)
    return ctx.canvas
  }

  let textProgramInfo: any
  textProgramInfo = twgl.createProgramInfo(gl, [
    TextShader.vertexShaderSource,
    TextShader.fragmentShaderSource,
  ])
  const textBufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: {
      numComponents: 2,
      data: [],
    },
    texcoord: {
      numComponents: 2,
      data: [],
    },
  })
  const textVAO = twgl.createVAOFromBufferInfo(
    gl,
    textProgramInfo,
    textBufferInfo
  )
  const textTexture = twgl.createTexture(gl, {
    src: fontImg,
    min: gl.LINEAR,
    mag: gl.LINEAR,
    flipY: 0,
    premultiplyAlpha: 1,
  })

  const makeVerticesForString = (fontInfo: any, s: string) => {
    let len = s.length
    let numVertices = len * 6
    let positions = new Float32Array(numVertices * 2)
    let texcoords = new Float32Array(numVertices * 2)
    let offset = 0
    let x = 0
    let maxX = fontInfo.textureWidth
    let maxY = fontInfo.textureHeight
    for (let ii = 0; ii < len; ++ii) {
      let letter = s[ii]
      let glyphInfo = fontInfo.glyphInfos[letter]
      if (glyphInfo) {
        let x2 = x + glyphInfo.width
        let u1 = glyphInfo.x / maxX
        let v1 = (glyphInfo.y + fontInfo.letterHeight - 1) / maxY
        let u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX
        let v2 = glyphInfo.y / maxY

        // 6 vertices per letter
        positions[offset + 0] = x
        positions[offset + 1] = 0
        texcoords[offset + 0] = u1
        texcoords[offset + 1] = v1

        positions[offset + 2] = x2
        positions[offset + 3] = 0
        texcoords[offset + 2] = u2
        texcoords[offset + 3] = v1

        positions[offset + 4] = x
        positions[offset + 5] = fontInfo.letterHeight
        texcoords[offset + 4] = u1
        texcoords[offset + 5] = v2

        positions[offset + 6] = x
        positions[offset + 7] = fontInfo.letterHeight
        texcoords[offset + 6] = u1
        texcoords[offset + 7] = v2

        positions[offset + 8] = x2
        positions[offset + 9] = 0
        texcoords[offset + 8] = u2
        texcoords[offset + 9] = v1

        positions[offset + 10] = x2
        positions[offset + 11] = fontInfo.letterHeight
        texcoords[offset + 10] = u2
        texcoords[offset + 11] = v2

        x += glyphInfo.width + fontInfo.spacing
        offset += 12
      } else {
        // we don't have this character so just advance
        x += fontInfo.spaceWidth
      }
    }

    // 返回用到的 TypedArrays 的 ArrayBufferViews
    return {
      positions,
      texcoords,
      numVertices: offset / 2,
    }
  }

  const modelList: any[] = []
  const initModelList = () => {
    for (let i = 0; i < 5; i++) {
      let model = cloneDeep(objects[0])
      model.translation = [
        Math.round(Math.random() * 1000) - 500,
        Math.round(Math.random() * 1000) - 500,
        Math.round(Math.random() * 500) - 250,
      ]

      modelList.push(model)
    }
  }
  initModelList()

  const dpr = window.devicePixelRatio
  const render = (time?: any) => {

    // @ts-ignore
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    twgl.resizeCanvasToDisplaySize(ctx.canvas)
    // Clear the 2D canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)

    const textMatrixList: any[] = []

    gl.useProgram(programInfo.program)
    gl.disable(gl.BLEND)
    gl.depthMask(true)
    modelList.forEach((model) => {
      let modelMatrix = twgl.m4.translation(
        twgl.v3.create(...model.translation)
      )
      modelMatrix = twgl.m4.rotateX(modelMatrix, time * 0.0005)
      modelMatrix = twgl.m4.rotateZ(modelMatrix, time * 0.0005)
      // modelMatrix = twgl.m4.translate(modelMatrix, twgl.v3.create(-16, -12, 0))

      let uniforms = model.uniforms
      uniforms.u_mvpMatrix = twgl.m4.multiply(
        projMatrix,
        twgl.m4.multiply(viewMatrix, modelMatrix)
      )

      gl.bindVertexArray(model.vao)
      twgl.setUniforms(programInfo, uniforms)
      twgl.drawBufferInfo(gl, model.bufferInfo)

      modelMatrix = twgl.m4.translate(
        modelMatrix,
        twgl.v3.create(-140, -140, 0)
      )
      const viewModelMatrix = twgl.m4.multiply(viewMatrix, modelMatrix)
      textMatrixList.push(
        twgl.v3.create(
          viewModelMatrix[12],
          viewModelMatrix[13],
          viewModelMatrix[14]
        )
      )
    })

    gl.useProgram(textProgramInfo.program)
    gl.enable(gl.BLEND)
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.depthMask(false)
    gl.bindVertexArray(null)
    textMatrixList.forEach((matrix) => {
      let name =
        matrix[0].toFixed(0) +
        ',' +
        matrix[1].toFixed(0) +
        ',' +
        matrix[2].toFixed(0)
      // debugger
      let vertices = makeVerticesForString(fontInfo, name)
      // gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo.attribs.a_position.buffer)
      // gl.bufferData(gl.ARRAY_BUFFER, vertices.positions, gl.DYNAMIC_DRAW)
      // gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo.attribs.a_texcoord.buffer)
      // gl.bufferData(gl.ARRAY_BUFFER, vertices.texcoords, gl.DYNAMIC_DRAW)

      let fromEye = twgl.v3.normalize(matrix)
      let amountToMoveTowardEye = 120
      // let viewX = matrix[0] - fromEye[0] * amountToMoveTowardEye
      // let viewY = matrix[1] - fromEye[1] * amountToMoveTowardEye
      // let viewZ = matrix[2] - fromEye[2] * amountToMoveTowardEye
      let viewX = matrix[0]
      let viewY = matrix[1]
      let viewZ = matrix[2]

      let desiredTextScale = -1 / gl.canvas.width // 1x1 像素大小
      let scale = viewZ * desiredTextScale

      let textMatrix = twgl.m4.translate(
        projMatrix,
        twgl.v3.create(viewX, viewY, viewZ)
      )
      textMatrix = twgl.m4.scale(textMatrix, twgl.v3.create(2 * dpr * scale, 2 * dpr * scale, 1))
      const textUniforms = {
        u_mvpMatrix: textMatrix,
        u_texture: textTexture,
        u_color: [1, 0.5, 0, 1],
      }

      gl.bindVertexArray(textVAO)
      const textBufferInfo = twgl.createBufferInfoFromArrays(gl, {
        position: {
          numComponents: 2,
          data: vertices.positions,
        },
        texcoord: {
          numComponents: 2,
          data: vertices.texcoords,
        },
      })
      twgl.setBuffersAndAttributes(gl, textProgramInfo, textBufferInfo)
      twgl.setUniforms(textProgramInfo, textUniforms)
      twgl.drawBufferInfo(gl, textBufferInfo, gl.TRIANGLES)
      // gl.drawArrays(gl.TRIANGLES, 0, vertices.numVertices);
    })

    animate = requestAnimationFrame(render)
  }
  render(Date.now())
}

export const clearDrawTextFrameBuffer = () => {
  gui && (gui.destroy(), (gui = undefined))
  cancelAnimationFrame(animate)
}
