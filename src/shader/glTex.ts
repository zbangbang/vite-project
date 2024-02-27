const TexCoordShader = {
  vertexShaderSource: `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main() {
      gl_Position = a_Position;
      v_TexCoord = a_TexCoord;
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    uniform sampler2D u_Sampler;
    uniform vec2 u_TextureSize;
    varying vec2 v_TexCoord;
    void main() {
      vec2 onePixel = vec2(1.0, 1.0) / u_TextureSize;

      gl_FragColor = (texture2D(u_Sampler, v_TexCoord) + texture2D(u_Sampler, v_TexCoord + vec2(onePixel.x, 0.0)) + texture2D(u_Sampler, v_TexCoord + vec2(-onePixel.x, 0.0))) / 3.0;
    }
  `
}

export { TexCoordShader }