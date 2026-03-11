/*
 * @FilePath: particle.ts
 * @Author: @zhangl
 * @Date: 2025-08-11 14:46:58
 * @LastEditTime: 2026-03-11 11:30:50
 * @LastEditors: @zhangl
 * @Description: 粒子效果
 */
import { initHelpLine } from './config'
import * as twgl from 'twgl.js'
import testImg from '@/assets/wind/2016112000.png'
import windData from '@/assets/wind/2016112000.json'
twgl.setDefaults({ attribPrefix: 'a_' })

/**
 * 粒子
 * @remarks:
 * @returns {*}
 */
const ParticleShader = {
  vertexShaderSource: `#version 300 es
    in float a_position;
    uniform mat4 u_mvpMatrix;
    uniform sampler2D u_particles;
    uniform float u_particles_res;

    out vec2 v_particle_pos;

    void main() {
      // 解出position对应的uv坐标,并取值,取到的是随机坐标信息
      vec4 color = texture(u_particles, vec2(
        fract(a_position / u_particles_res),
        floor(a_position / u_particles_res) / u_particles_res));

      // decode current particle position from the pixel's RGBA value
      v_particle_pos = vec2(
          color.r / 255.0 + color.b,
          color.g / 255.0 + color.a);

      float x = (v_particle_pos.x * 2.0) - 1.0; // [0, 1] -> [-1, 1]
      float y = (v_particle_pos.y * 2.0) - 1.0; // [0, 1] -> [-1, 1]
      gl_PointSize = 1.0;
      gl_Position = u_mvpMatrix * vec4(x, y, 0, 1);
      // gl_Position = vec4(2.0 * v_particle_pos.x - 1.0, 1.0 - 2.0 * v_particle_pos.y, 0, 1);
    }
  `,
  fragmentShaderSource: `#version 300 es
    precision mediump float;
    uniform sampler2D u_sampler;
    uniform vec2 u_wind_min;
    uniform vec2 u_wind_max;
    uniform sampler2D u_color_sampler;

    in vec2 v_particle_pos;
    out vec4 outColor;
    void main() {
      vec2 velocity = mix(u_wind_min, u_wind_max, texture(u_sampler, v_particle_pos).rg);
      float speed_t = length(velocity) / length(u_wind_max);

      // color ramp is encoded in a 16x16 texture
      vec2 ramp_pos = vec2(
          fract(16.0 * speed_t),
          floor(16.0 * speed_t) / 16.0);

      outColor = texture(u_color_sampler, ramp_pos);
    }
  `,
  updateVS: `#version 300 es
    precision mediump float;
    in vec2 a_position;
    uniform mat4 u_mvpMatrix;
    out vec2 v_tex_pos;

    void main() {
      v_tex_pos = a_position;
      gl_Position = vec4(1.0 - 2.0 * a_position, 0, 1);
    }
  `,
  updateFS: `#version 300 es
    precision highp float;

    uniform sampler2D u_particles;
    uniform sampler2D u_sampler;
    uniform vec2 u_wind_res;
    uniform vec2 u_wind_min;
    uniform vec2 u_wind_max;
    uniform float u_rand_seed;
    uniform float u_speed_factor;
    uniform float u_drop_rate;
    uniform float u_drop_rate_bump;

    in vec2 v_tex_pos;
    out vec4 outColor;

    // pseudo-random generator
    const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);
    float rand(const vec2 co) {
        float t = dot(rand_constants.xy, co);
        return fract(sin(t) * (rand_constants.z + t));
    }

    // wind speed lookup; use manual bilinear filtering based on 4 adjacent pixels for smooth interpolation
    vec2 lookup_wind(const vec2 uv) {
        // return texture(u_sampler, uv).rg; // lower-res hardware filtering
        vec2 px = 1.0 / u_wind_res;
        vec2 vc = (floor(uv * u_wind_res)) * px;
        vec2 f = fract(uv * u_wind_res);
        vec2 tl = texture(u_sampler, vc).rg;
        vec2 tr = texture(u_sampler, vc + vec2(px.x, 0)).rg;
        vec2 bl = texture(u_sampler, vc + vec2(0, px.y)).rg;
        vec2 br = texture(u_sampler, vc + px).rg;
        return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);
    }

    void main() {
        vec4 color = texture(u_particles, v_tex_pos);
        vec2 pos = vec2(
            color.r / 255.0 + color.b,
            color.g / 255.0 + color.a); // decode particle position from pixel RGBA

        vec2 velocity = mix(u_wind_min, u_wind_max, lookup_wind(pos));
        float speed_t = length(velocity) / length(u_wind_max);

        // take EPSG:4236 distortion into account for calculating where the particle moved
        float distortion = cos(radians(pos.y * 180.0 - 90.0));
        vec2 offset = vec2(velocity.x / distortion, -velocity.y) * 0.0001 * u_speed_factor;

        // update particle position, wrapping around the date line
        pos = fract(1.0 + pos + offset);

        // a random seed to use for the particle drop
        vec2 seed = (pos + v_tex_pos) * u_rand_seed;

        // drop rate is a chance a particle will restart at random position, to avoid degeneration
        float drop_rate = u_drop_rate + speed_t * u_drop_rate_bump;
        float drop = step(1.0 - drop_rate, rand(seed));

        vec2 random_pos = vec2(
            rand(seed + 1.3),
            rand(seed + 2.1));
        pos = mix(pos, random_pos, drop);

        // encode the new particle position back into RGBA
        outColor = vec4(
            fract(pos * 255.0),
            floor(pos * 255.0) / 255.0);
        // outColor = color;
    }
  `,
  screenFS: `#version 300 es
    precision mediump float;

    uniform sampler2D u_screen;
    uniform float u_opacity;

    in vec2 v_tex_pos;
    out vec4 outColor;

    void main() {
        vec4 color = texture(u_screen, 1.0 - v_tex_pos);
        // a hack to guarantee opacity fade out even with a value close to 1.0
        outColor = vec4(floor(255.0 * color * u_opacity) / 255.0);
    }
  `
}

const defaultRampColors = {
  0.0: '#3288bd',
  0.1: '#66c2a5',
  0.2: '#abdda4',
  0.3: '#e6f598',
  0.4: '#fee08b',
  0.5: '#fdae61',
  0.6: '#f46d43',
  1.0: '#d53e4f'
}
function getColorRamp(colors: any) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = 256;
  canvas.height = 1;

  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  for (const stop in colors) {
    gradient.addColorStop(+stop, colors[stop]);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);

  return new Uint8Array(ctx.getImageData(0, 0, 256, 1).data)
}

let animate: any
export const initParticle = (gl: WebGLRenderingContext) => {
  const { drawHelpLine } = initHelpLine(gl)
  let programInfo: any, updateProgramInfo: any, screenProgramInfo: any
  programInfo = twgl.createProgramInfo(gl, [
    ParticleShader.vertexShaderSource,
    ParticleShader.fragmentShaderSource,
  ])
  updateProgramInfo = twgl.createProgramInfo(gl, [
    ParticleShader.updateVS,
    ParticleShader.updateFS,
  ])
  screenProgramInfo = twgl.createProgramInfo(gl, [
    ParticleShader.updateVS,
    ParticleShader.screenFS,
  ])
  const updateParticleInfo = twgl.createBufferInfoFromArrays(gl, {
    position: {
      numComponents: 2,
      data: [0, 0, 1, 0, 0, 1, 1, 1],
    },
    indices: {
      numComponents: 3,
      data: [0, 1, 2, 1, 2, 3],
    },
  })

  let total = 16384
  let numParticles = 65536
  let particleRes: number = 128, particleTexture0: WebGLTexture, particleTexture1: WebGLTexture, backgroundTexture: WebGLTexture, screenTexture: WebGLTexture
  let particleIndices: number[] = []
  const fadeOpacity = 0.95
  const speedFactor = 0.25
  const dropRate = 0.003
  const dropRateBump = 0.01
  const initData = () => {
    particleRes = Math.ceil(Math.sqrt(total))
    numParticles = particleRes * particleRes

    const particleState = new Uint8Array(numParticles * 4);
    for (let i = 0; i < particleState.length; i++) {
      particleState[i] = Math.floor(Math.random() * 256); // randomize the initial particle positions
    }
    particleTexture0 = twgl.createTexture(gl, {
      src: particleState,
      min: gl.NEAREST,
      mag: gl.NEAREST,
      width: particleRes,
      height: particleRes,
      format: gl.RGBA,          // 数据格式
      internalFormat: gl.RGBA,   // 纹理存储格式 (可选，通常与format一致)
      type: gl.UNSIGNED_BYTE,
    })
    particleTexture1 = twgl.createTexture(gl, {
      src: particleState,
      min: gl.NEAREST,
      mag: gl.NEAREST,
      width: particleRes,
      height: particleRes,
      format: gl.RGBA,          // 数据格式
      internalFormat: gl.RGBA,   // 纹理存储格式 (可选，通常与format一致)
      type: gl.UNSIGNED_BYTE,
    })

    particleIndices = []
    for (let i = 0; i < numParticles; i++) { particleIndices.push(i) }

    const emptyPixels = new Uint8Array(gl.canvas.width * gl.canvas.height * 4);
    backgroundTexture = twgl.createTexture(gl, {
      src: emptyPixels,
      min: gl.NEAREST,
      mag: gl.NEAREST,
      width: gl.canvas.width,
      height: gl.canvas.height,
      format: gl.RGBA,          // 数据格式
      internalFormat: gl.RGBA,   // 纹理存储格式 (可选，通常与format一致)
      type: gl.UNSIGNED_BYTE,
    })
    screenTexture = twgl.createTexture(gl, {
      src: emptyPixels,
      min: gl.NEAREST,
      mag: gl.NEAREST,
      width: gl.canvas.width,
      height: gl.canvas.height,
      format: gl.RGBA,          // 数据格式
      internalFormat: gl.RGBA,   // 纹理存储格式 (可选，通常与format一致)
      type: gl.UNSIGNED_BYTE,
    })
  }
  initData()
  const particleInfo = twgl.createBufferInfoFromArrays(gl, {
    position: {
      numComponents: 1,
      data: particleIndices,
    },
  })

  const texture = twgl.createTexture(gl, {
    src: testImg,
    min: gl.LINEAR,
    mag: gl.LINEAR,
    // wrapS: gl.CLAMP_TO_EDGE,
    // wrapT: gl.CLAMP_TO_EDGE,
    // flipY: 0,
  })

  let particleFbo1 = twgl.createFramebufferInfo(gl, [{
    attachment: particleTexture0
  }], particleRes, particleRes)
  let particleFbo2 = twgl.createFramebufferInfo(gl, [{
    attachment: particleTexture1
  }], particleRes, particleRes)
  let backgroundFbo = twgl.createFramebufferInfo(gl, [{
    attachment: backgroundTexture
  }], gl.canvas.width, gl.canvas.height)
  let screenFbo = twgl.createFramebufferInfo(gl, [{
    attachment: screenTexture
  }], gl.canvas.width, gl.canvas.height)

  let colorTexture: any
  const setColorRamp = (colors: any) => {
    colorTexture = twgl.createTexture(gl, {
      src: getColorRamp(colors),
      min: gl.LINEAR,
      mag: gl.LINEAR,
      width: 16,
      height: 16,
      format: gl.RGBA,          // 数据格式
      internalFormat: gl.RGBA,   // 纹理存储格式 (可选，通常与format一致)
      type: gl.UNSIGNED_BYTE,
    })
  }
  setColorRamp(defaultRampColors)

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

  let mvpMatrix = initMvp(0, 0, 2)

  const drawScreen = () => {
    gl.useProgram(screenProgramInfo.program)
    twgl.bindFramebufferInfo(gl, screenFbo)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    const uniforms = {
      u_mvpMatrix: mvpMatrix,
      u_screen: backgroundFbo.attachments[0],
      u_opacity: fadeOpacity
    }
    twgl.setBuffersAndAttributes(gl, screenProgramInfo, updateParticleInfo)
    twgl.setUniforms(screenProgramInfo, uniforms)
    twgl.drawBufferInfo(gl, updateParticleInfo, gl.TRIANGLES)

    drawParticle()

    gl.useProgram(screenProgramInfo.program)
    twgl.bindFramebufferInfo(gl, null)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const uniforms1 = {
      u_mvpMatrix: mvpMatrix,
      u_screen: screenFbo.attachments[0],
      u_opacity: 1
    }
    twgl.setBuffersAndAttributes(gl, screenProgramInfo, updateParticleInfo)
    twgl.setUniforms(screenProgramInfo, uniforms1)
    twgl.drawBufferInfo(gl, updateParticleInfo, gl.TRIANGLES)
    gl.disable(gl.BLEND);

    const temp = backgroundFbo
    backgroundFbo = screenFbo
    screenFbo = temp
  }

  const drawParticle = () => {
    gl.useProgram(programInfo.program)
    // twgl.bindFramebufferInfo(gl, null)
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    // gl.clearColor(0.2, 0.2, 0.4, 1.0)
    // gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    const uniforms = {
      u_mvpMatrix: mvpMatrix,
      u_sampler: texture,
      u_particles: particleFbo1.attachments[0],
      u_color_sampler: colorTexture,
      u_particles_res: particleRes,
      u_wind_min: [windData.uMin, windData.vMin],
      u_wind_max: [windData.uMax, windData.vMax],
    }
    twgl.setBuffersAndAttributes(gl, programInfo, particleInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, particleInfo, gl.POINTS)
  }

  const updateParticle = () => {
    gl.useProgram(updateProgramInfo.program)
    twgl.bindFramebufferInfo(gl, particleFbo2)
    gl.viewport(0, 0, particleRes, particleRes)
    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    const uniforms = {
      u_mvpMatrix: mvpMatrix,
      u_sampler: texture,
      u_particles: particleFbo1.attachments[0],
      u_rand_seed: Math.random(),
      u_wind_res: [windData.width, windData.height],
      u_wind_min: [windData.uMin, windData.vMin],
      u_wind_max: [windData.uMax, windData.vMax],
      u_speed_factor: speedFactor,
      u_drop_rate: dropRate,
      u_drop_rate_bump: dropRateBump
    }
    twgl.setBuffersAndAttributes(gl, updateProgramInfo, updateParticleInfo)
    twgl.setUniforms(updateProgramInfo, uniforms)
    twgl.drawBufferInfo(gl, updateParticleInfo, gl.TRIANGLES)

    let temp = particleFbo1
    particleFbo1 = particleFbo2
    particleFbo2 = temp
  }

  // @ts-ignore
  twgl.resizeCanvasToDisplaySize(gl.canvas)
  const render = () => {
    drawScreen()
    updateParticle()
    drawHelpLine(mvpMatrix)
    animate = requestAnimationFrame(render)
  }
  render()
}

export const clearFrameBuffer = () => {
  cancelAnimationFrame(animate)
}
