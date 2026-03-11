import * as twgl from 'twgl.js'
twgl.setDefaults({ attribPrefix: 'a_' })

export enum BtnType {
  frameBuffer,
  particle,
}

export const cubeTexCoords = [
  1.0,
  1.0,
  0.0,
  1.0,
  0.0,
  0.0,
  1.0,
  0.0, // v0-v1-v2-v3 front
  0.0,
  1.0,
  0.0,
  0.0,
  1.0,
  0.0,
  1.0,
  1.0, // v0-v3-v4-v5 right
  1.0,
  0.0,
  1.0,
  1.0,
  0.0,
  1.0,
  0.0,
  0.0, // v0-v5-v6-v1 up
  1.0,
  1.0,
  0.0,
  1.0,
  0.0,
  0.0,
  1.0,
  0.0, // v1-v6-v7-v2 left
  0.0,
  0.0,
  1.0,
  0.0,
  1.0,
  1.0,
  0.0,
  1.0, // v7-v4-v3-v2 down
  0.0,
  0.0,
  1.0,
  0.0,
  1.0,
  1.0,
  0.0,
  1.0, // v4-v7-v6-v5 back
]

export const initHelpLine = (gl: WebGLRenderingContext) => {
  const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    uniform mat4 u_matrix;
    varying vec4 v_color;
    void main() {
      gl_Position = u_matrix * vec4(a_position, 1);
      v_color = vec4(a_color, 1.0);
    }
  `
  const fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
      gl_FragColor = v_color;
    }
  `

  let programInfo: any
  let bufferInfo: any
  const initHelp = () => {
    programInfo = twgl.createProgramInfo(gl, [
      vertexShaderSource,
      fragmentShaderSource,
    ])
    const arrays = {
      position: {
        numComponents: 3,
        data: [0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 5],
      },
      color: {
        numComponents: 3,
        data: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
      },
    }
    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
  }

  initHelp()
  const drawHelpLine = (mvpMatrix: twgl.m4.Mat4) => {
    const uniforms = {
      u_matrix: mvpMatrix,
    }

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.LINE_STRIP)
  }

  return { drawHelpLine }
}

export const TextureFrameBufferShader = {
  vertexShaderSource: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    void main() {
      gl_Position = a_position;
      v_texCoord = a_texCoord;
    }
  `,
  fragmentShaderSource: `#version 300 es
    precision mediump float;
    uniform sampler2D u_sampler;
    uniform float u_kernel[9];
    uniform float u_kernelWeight;
    in vec2 v_texCoord;
    out vec4 outColor;
    void main() {
      vec2 onePixel = vec2(1) / vec2(textureSize(u_sampler, 0));
      vec4 colorSum =
      texture(u_sampler, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
      texture(u_sampler, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
      texture(u_sampler, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
      texture(u_sampler, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
      texture(u_sampler, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
      texture(u_sampler, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
      texture(u_sampler, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
      texture(u_sampler, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
      texture(u_sampler, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;
      outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
      // outColor = texture(u_sampler,v_texCoord);
    }
  `,
}

/**
 * 渲染到纹理
 * @remarks:
 * @returns {*}
 */
export const FrameBufferShader = {
  vertexShaderSource: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    uniform mat4 u_mvpMatrix;
    out vec2 v_texCoord;
    void main() {
      gl_Position = u_mvpMatrix * a_position;
      v_texCoord = a_texCoord;
    }
  `,
  fragmentShaderSource: `#version 300 es
    precision mediump float;
    uniform sampler2D u_sampler;
    in vec2 v_texCoord;
    out vec4 outColor;
    void main() {
      outColor = texture(u_sampler,v_texCoord);
    }
  `,
}

/**
 * 粒子
 * @remarks:
 * @returns {*}
 */
export const ParticleShader = {
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
