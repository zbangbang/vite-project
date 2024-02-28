const TexCoordShader = {
  vertexShaderSource: `
    attribute vec2 a_Position;
    attribute vec2 a_TexCoord;
    uniform mat3 u_Matrix;
    varying vec2 v_TexCoord;
    void main() {
      gl_Position = vec4((u_Matrix * vec3(a_Position, 1)).xy, 0, 1);
      v_TexCoord = a_TexCoord;
    }
  `,
  fragmentShaderSource: `
    precision mediump float;
    uniform sampler2D u_Sampler;
    uniform vec2 u_TextureSize;
    uniform float u_kernel[9];
    uniform float u_kernelWeight;
    varying vec2 v_TexCoord;
    void main() {
      vec2 onePixel = vec2(1.0, 1.0) / u_TextureSize;

      // gl_FragColor = texture2D(u_Sampler, v_TexCoord);
      vec4 colorSum = texture2D(u_Sampler, v_TexCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
        texture2D(u_Sampler, v_TexCoord + onePixel * vec2(0, -1)) * u_kernel[1] +
        texture2D(u_Sampler, v_TexCoord + onePixel * vec2(1, -1)) * u_kernel[2] +
        texture2D(u_Sampler, v_TexCoord + onePixel * vec2(-1, 0)) * u_kernel[3] +
        texture2D(u_Sampler, v_TexCoord + onePixel * vec2(0, 0)) * u_kernel[4] +
        texture2D(u_Sampler, v_TexCoord + onePixel * vec2(1, 0)) * u_kernel[5] +
        texture2D(u_Sampler, v_TexCoord + onePixel * vec2(-1, 1)) * u_kernel[6] +
        texture2D(u_Sampler, v_TexCoord + onePixel * vec2(0, 1)) * u_kernel[7] +
        texture2D(u_Sampler, v_TexCoord + onePixel * vec2(1, 1)) * u_kernel[8];
      gl_FragColor = vec4((colorSum / u_kernelWeight).xyz, 1);
    }
  `
}

export { TexCoordShader }