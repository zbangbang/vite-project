const TrangleShader = {
  vertexShaderSource: `
    attribute vec2 a_Position;
    attribute vec3 a_Color;
    uniform mat3 u_Matrix;
    varying vec4 v_Color;
    void main() {
      gl_Position = vec4((u_Matrix * vec3(a_Position, 1)).xy, 0, 1);
      v_Color = vec4(a_Color, 1.0);
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

/**
 * @Date: 2024-02-21 18:05:02
 * @Description: 像素位置归一化（原始）
 * @return {*}
 */
const PixelTrangleShader = {
  vertexShaderSource: `
    attribute vec2 a_Position;
    uniform vec2 u_resolution;
    varying vec4 v_Color;
    void main() {
      vec2 zeroToOne = a_Position / u_resolution;
      vec2 normalOne = zeroToOne * 2.0 - 1.0;
      gl_Position = vec4(normalOne * vec2(1.0, -1.0), 0, 1);
      v_Color = gl_Position * 0.5 + 0.5;
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

export { TrangleShader, PixelTrangleShader }