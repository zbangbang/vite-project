const PointShader = {
  vertexShaderSource:  `
    attribute vec4 a_Position;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = 10.0;
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
      gl_FragColor = u_FragColor;
    }
  `
}

const TriangleShader = {
  vertexShaderSource:  `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
      gl_Position = a_Position;
      v_Color = a_Color;
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
      gl_FragColor = v_Color;
    }
  `
}

const TriangleMatrixShader = {
  vertexShaderSource:  `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    uniform mat4 u_MvpMatrix;
    void main() {
      gl_Position = u_MvpMatrix * a_Position;
      v_Color = a_Color;
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
      gl_FragColor = v_Color;
    }
  `
}

export { PointShader, TriangleShader, TriangleMatrixShader }