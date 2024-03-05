const ThreeShader = {
  vertexShaderSource: `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_Matrix;
    varying vec4 v_Color;
    void main() {
      gl_Position = u_Matrix * a_Position;
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

export { ThreeShader }