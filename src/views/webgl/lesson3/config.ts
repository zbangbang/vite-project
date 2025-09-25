import * as twgl from 'twgl.js'
twgl.setDefaults({ attribPrefix: 'a_' })

export enum BtnType {
  texture,
  viewMatrix,
  cube,
  light,
  pointLight,
  model,
  mouse,
  fog,
  frameBuffer
}

export const cubePosition = [
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
]
export const cubeIndices = [
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
export const cubeColor = [
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
]
export const cubeNormal = [
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

export const cubeTexCoords = [
  1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v0-v1-v2-v3 front
  0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,    // v0-v3-v4-v5 right
  1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,    // v0-v5-v6-v1 up
  1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v1-v6-v7-v2 left
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // v7-v4-v3-v2 down
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0     // v4-v7-v6-v5 back
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
        data: [
          0, 0, 0,
          5, 0, 0,
          0, 0, 0,
          0, 5, 0,
          0, 0, 0,
          0, 0, 5
        ],
      },
      color: {
        numComponents: 3,
        data: [
          1, 0, 0,
          1, 0, 0,
          0, 1, 0,
          0, 1, 0,
          0, 0, 1,
          0, 0, 1
        ],
      },
    }
    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
  }

  initHelp()
  const drawHelpLine = (mvpMatrix: twgl.m4.Mat4) => {
    const uniforms = {
      u_matrix: mvpMatrix
    }

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo, gl.LINE_STRIP)
  }

  return { drawHelpLine }
}

export const TextureShader = {
  vertexShaderSource: `
    attribute vec3 a_position;
    attribute vec3 a_color;
    attribute vec2 a_texCoord;
    uniform mat4 u_matrix;
    varying vec4 v_color;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_texCoord;
      gl_Position = u_matrix * vec4(a_position, 1);
      gl_PointSize = 10.0;
      v_color = vec4(a_color, 1.0);
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    uniform sampler2D u_sampler;
    uniform sampler2D u_sampler1;
    varying vec2 v_texCoord;
    varying vec4 v_color;
    void main() {
      vec4 c1 = texture2D(u_sampler, v_texCoord);
      vec4 c2 = texture2D(u_sampler1, v_texCoord);
      gl_FragColor = c1 * c2;
    }
  `
}

export const ViewMatrixShader = {
  vertexShaderSource: `
    attribute vec3 a_position;
    attribute vec4 a_color;
    uniform mat4 u_mvpMatrix;
    varying vec4 v_color;
    void main() {
      gl_Position = u_mvpMatrix * vec4(a_position, 1);
      v_color = a_color;
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    varying vec4 v_color;
    void main() {
      gl_FragColor = v_color;
    }
  `
}

/**
 * 平行光
 * @remarks:
 * @returns {*}
 */
export const LightShader = {
  vertexShaderSource: `
    attribute vec3 a_position;
    attribute vec3 a_color;
    attribute vec3 a_normal;
    uniform mat4 u_mvpMatrix;
    uniform mat4 u_normalMatrix;
    uniform vec3 u_light;
    uniform vec3 u_lightDir;
    uniform vec3 u_ambient;
    varying vec4 v_color;
    void main() {
      gl_Position = u_mvpMatrix * vec4(a_position, 1);
      vec3 normal = normalize(vec3((u_normalMatrix * vec4(a_normal, 1.0))));
      float dotN = max(dot(u_lightDir,normal), 0.0);
      vec3 diffuse = u_light * vec3(a_color) * dotN;
      vec3 ambient = u_ambient * vec3(a_color);
      v_color = vec4(diffuse + ambient, 1.0);
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    varying vec4 v_color;
    void main() {
      gl_FragColor = v_color;
    }
  `
}
/**
 * 点光源
 * @remarks:
 * @returns {*}
 */
export const PointLightShader = {
  vertexShaderSource: `
    attribute vec3 a_position;
    attribute vec3 a_color;
    attribute vec3 a_normal;
    uniform mat4 u_modelMatrix;
    uniform mat4 u_mvpMatrix;
    uniform mat4 u_normalMatrix;
    varying vec4 v_color;
    varying vec3 v_normal;
    varying vec3 v_position;
    void main() {
      gl_Position = u_mvpMatrix * vec4(a_position, 1);
      v_normal = normalize(vec3((u_normalMatrix * vec4(a_normal, 1.0))));
      v_position = vec3(u_modelMatrix * vec4(a_position, 1));
      v_color = vec4(a_color, 1.0);
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    uniform vec3 u_light;
    uniform vec3 u_lightPos;
    uniform vec3 u_ambient;
    varying vec4 v_color;
    varying vec3 v_normal;
    varying vec3 v_position;
    void main() {
      vec3 normal = normalize(v_normal);
      vec3 lightDir = normalize(u_lightPos - v_position);
      float dotN = max(dot(lightDir,normal), 0.0);
      vec3 diffuse = u_light * v_color.rgb * dotN;
      vec3 ambient = u_ambient * v_color.rgb;
      gl_FragColor = vec4(diffuse + ambient, 1.0);
    }
  `
}

/**
 * 层次模型
 * @remarks:
 * @returns {*}
 */
export const ModelShader = {
  vertexShaderSource: `
    attribute vec3 a_position;
    attribute vec3 a_normal;
    uniform mat4 u_mvpMatrix;
    uniform mat4 u_normalMatrix;
    varying vec4 v_color;
    varying vec3 v_normal;
    void main() {
      gl_Position = u_mvpMatrix * vec4(a_position, 1);
      v_normal = normalize(vec3((u_normalMatrix * vec4(a_normal, 1.0))));
      v_color = vec4(1.0, 0.4, 0.0, 1.0);
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    uniform vec3 u_light;
    uniform vec3 u_lightDir;
    uniform vec3 u_ambient;
    varying vec4 v_color;
    varying vec3 v_normal;
    void main() {
      vec3 normal = normalize(v_normal);
      float dotN = max(dot(u_lightDir,normal), 0.0);
      vec3 diffuse = u_light * v_color.rgb * dotN;
      vec3 ambient = u_ambient * v_color.rgb;
      gl_FragColor = vec4(diffuse + ambient, 1.0);
    }
  `
}

/**
 * 鼠标操作
 * @remarks:
 * @returns {*}
 */
export const MouseShader = {
  vertexShaderSource: `
    attribute vec3 a_position;
    attribute vec4 a_color;
    attribute vec3 a_normal;
    attribute float a_face;
    uniform mat4 u_mvpMatrix;
    uniform mat4 u_normalMatrix;
    varying vec4 v_color;
    varying vec3 v_normal;
    varying float v_face;
    void main() {
      gl_Position = u_mvpMatrix * vec4(a_position, 1);
      v_normal = normalize(vec3((u_normalMatrix * vec4(a_normal, 1.0))));
      v_color = a_color;
      v_face = a_face;
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    uniform vec3 u_light;
    uniform vec3 u_lightDir;
    uniform vec3 u_ambient;
    uniform int u_click;
    varying vec4 v_color;
    varying vec3 v_normal;
    varying float v_face;
    void main() {
      float dotN = max(dot(u_lightDir,v_normal), 0.0);
      vec3 diffuse = u_light * v_color.rgb * dotN;
      vec3 ambient = u_ambient * v_color.rgb;

      int face = int(v_face);
      vec3 color = (face == u_click) ? vec3(1.0) : diffuse + ambient;
      if (u_click == 0) {
        gl_FragColor = vec4(color, v_face / 255.0);
      } else {
        gl_FragColor = vec4(color, v_color.a);
      }
    }
  `
}

/**
 * 雾
 * @remarks:
 * @returns {*}
 */
export const FogShader = {
  vertexShaderSource: `
    attribute vec3 a_position;
    attribute vec3 a_color;
    uniform mat4 u_modelMatrix;
    uniform mat4 u_mvpMatrix;
    uniform vec3 u_eye;
    varying vec4 v_color;
    varying float v_dist;
    void main() {
      gl_Position = u_mvpMatrix * vec4(a_position, 1);
      v_color = vec4(a_color, 1.0);
      // v_dist = distance(u_modelMatrix * vec4(a_position, 1), vec4(u_eye, 1));
      v_dist = gl_Position.w;
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    uniform vec2 u_fogDist;
    uniform vec3 u_fogColor;
    varying vec4 v_color;
    varying float v_dist;
    void main() {
      float fogFactor = clamp((u_fogDist.y - v_dist) / (u_fogDist.y - u_fogDist.x), 0.0, 1.0);
      vec3 color = mix(u_fogColor, v_color.rgb, fogFactor);
      gl_FragColor = vec4(color, v_color.a);
    }
  `
}

/**
 * 渲染到纹理
 * @remarks:
 * @returns {*}
 */
export const FrameBufferShader = {
  vertexShaderSource: `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    uniform mat4 u_mvpMatrix;
    varying vec2 v_texCoord;
    void main() {
      gl_Position = u_mvpMatrix * a_position;
      v_texCoord = a_texCoord;
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    uniform sampler2D u_sampler;
    varying vec2 v_texCoord;
    void main() {
      gl_FragColor = texture2D(u_sampler, v_texCoord);
    }
  `
}