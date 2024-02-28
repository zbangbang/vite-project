/**
 * @Date: 2024-02-28 10:38:00
 * @Description: 材质贴图
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param {any} texImg
 * @return {*}
 */
export default function useTexCoord(gl: WebGLRenderingContext, program: WebGLProgram, texImg: any) {
  // 材质
  const drawTexCoord = (kernel: number[]) => {
    let matrix = m3.projection(
      (gl!.canvas as HTMLCanvasElement).clientWidth,
      (gl!.canvas as HTMLCanvasElement).clientHeight
    )
    let u_Matrix = gl!.getUniformLocation(program, 'u_Matrix')
    gl!.uniformMatrix3fv(u_Matrix, false, matrix)

    let a_Position = gl!.getAttribLocation(program, 'a_Position')
    let verticesSizes = new Float32Array([
      //四个顶点的位置和纹理数据
      // -0.5, 0.5, -0.3, 1.7, -0.5, -0.5, -0.3, -0.2, 0.5, 0.5, 1.7, 1.7, 0.5, -0.5,
      // 1.7, -0.2,
      100, 100, 0.0, 1.0, 100, 500, 0.0, 0.0, 500, 100, 1.0, 1.0, 500, 500, 1.0,
      0.0,
    ])

    let vertexSizeBuffer = gl!.createBuffer()
    gl!.bindBuffer(gl!.ARRAY_BUFFER, vertexSizeBuffer)
    gl!.bufferData(
      gl!.ARRAY_BUFFER,
      verticesSizes,
      gl!.STATIC_DRAW
    )
    let FSIZE = verticesSizes.BYTES_PER_ELEMENT
    gl!.vertexAttribPointer(
      a_Position,
      2,
      gl!.FLOAT,
      false,
      FSIZE * 4,
      0
    )
    gl!.enableVertexAttribArray(a_Position)

    // 卷积
    let kernelLocation = gl!.getUniformLocation(program, 'u_kernel[0]')
    let kernelWeightLocation = gl!.getUniformLocation(
      program,
      'u_kernelWeight'
    )
    gl!.uniform1fv(kernelLocation, kernel)
    gl!.uniform1f(
      kernelWeightLocation,
      computeKernelWeight(kernel)
    )

    // 纹理
    let a_TexCoord = gl!.getAttribLocation(program, 'a_TexCoord')
    gl!.vertexAttribPointer(
      a_TexCoord,
      2,
      gl!.FLOAT,
      false,
      FSIZE * 4,
      FSIZE * 2
    )
    gl!.enableVertexAttribArray(a_TexCoord)

    initTexture(gl!, program)
  }

  /**
   * @Date: 2024-02-28 09:57:09
   * @Description: 计算卷积核的总权重
   * @param {*} kernel
   * @return {*}
   */
  const computeKernelWeight = (kernel: number[]) => {
    let weight = kernel.reduce(function (prev, curr) {
      return prev + curr
    })
    return weight <= 0 ? 1 : weight
  }

  /**
   * @Date: 2024-02-28 09:57:42
   * @Description: 重绘
   * @return {*}
   */
  const reDrawTexCoord = (kernel: number[]) => {
    let kernelLocation = gl!.getUniformLocation(program, 'u_kernel[0]')
    let kernelWeightLocation = gl!.getUniformLocation(
      program,
      'u_kernelWeight'
    )
    gl!.uniform1fv(kernelLocation, kernel)
    gl!.uniform1f(
      kernelWeightLocation,
      computeKernelWeight(kernel)
    )

    initTexture(gl!, program)
  }

  const initTexture = (gl: WebGLRenderingContext, program: WebGLProgram) => {
    let image = new Image()
    image.src = texImg
    image.onload = () => {
      loadTexture(gl, program, image)
    }
  }
  const loadTexture = (
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    image: HTMLImageElement
  ) => {
    const u_TextureSize = gl.getUniformLocation(program, 'u_TextureSize')
    gl.uniform2f(u_TextureSize, image.width, image.height)

    let texture: WebGLTexture = gl.createTexture()!
    let u_Sampler = gl.getUniformLocation(program, 'u_Sampler')
    console.log(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), '纹理单元个数')
    // y轴反转，图片坐标系和gl坐标系不同
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    // 开启0号纹理单元
    gl.activeTexture(gl.TEXTURE0)
    //绑定纹理数据
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    // 配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    // 将0号纹理传递给着色器
    gl.uniform1i(u_Sampler, 0)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  return {
    drawTexCoord,
    reDrawTexCoord
  }
}