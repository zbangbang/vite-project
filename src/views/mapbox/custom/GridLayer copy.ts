/*
 * @FilePath: GridLayer.ts
 * @Author: @zhangl
 * @Date: 2024-09-25 16:20:35
 * @LastEditTime: 2024-09-26 17:01:44
 * @LastEditors: @zhangl
 * @Description:
 */
import mapboxgl, { MercatorCoordinate } from 'mapbox-gl'
export type ISourceData = ImageBitmap[]

export default class GridLayer {
  public id: string
  public type: 'custom' = 'custom'
  public renderingMode: "3d" | "2d" | undefined
  public program: WebGLProgram | null = null
  public map: mapboxgl.Map | null = null
  public image: any
  private data: ISourceData = []
  private levelList: number[] = []
  private textureDataInfo: {
    width: number,
    height: number,
    imageBuffer: any
  } | null

  constructor(tData: ISourceData, options: any) {
    this.id = 'customLayerId'
    this.type = 'custom'
    this.renderingMode = '3d'
    this.image = tData[0]
    this.data = tData
    this.levelList = [1, 2, 3, 4]
    this.textureDataInfo = this.createImageInfo()
  }

  createImageInfo() {
    return {
      width: this.data[0].width,
      height: this.data[0].height,
      imageBuffer: this.data,
    };
  }

  onAdd(map: mapboxgl.Map, gl: WebGL2RenderingContext) {
    const vertexSource = `#version 300 es
      layout(location=0) in vec3 a_pos;
      layout(location=1) in vec2 aTexCoord;

	    out vec2 vTexCoord;
      uniform mat4 u_matrix;
      void main() {
        vTexCoord = aTexCoord;
        gl_Position = u_matrix * vec4(a_pos, 1.0);
        gl_PointSize = 20.0;
      }`

    const fragmentSource = `#version 300 es
      precision highp float;
      in vec2 vTexCoord;
      out vec4 fragColor;
      uniform sampler2D uSampler;
      void main() {
        fragColor = texture(uSampler, vTexCoord);
      }`

    this.map = map
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexSource)
    gl.compileShader(vertexShader)
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentSource)
    gl.compileShader(fragmentShader)

    this.program = gl.createProgram()!
    gl.attachShader(this.program, vertexShader)
    gl.attachShader(this.program, fragmentShader)
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.log(gl.getShaderInfoLog(vertexShader))
      console.log(gl.getShaderInfoLog(fragmentShader))
    }
  }

  /**
   *
   * 计算纹理坐标，左上，左下，右上，右下
   * @returns
   * @memberof GridLayer
   */
  calVerticesTexCoords(options: any) {
    let { startLon, startLat, endLon, endLat, altitude, altScale } = options;
    altitude = altitude ?? 1;
    altScale = altScale ?? 1;
    let startVertex: MercatorCoordinate[] = [];
    let endVertex: MercatorCoordinate[] = [];
    startVertex = [mapboxgl.MercatorCoordinate.fromLngLat([startLon, startLat], altitude * altScale)];
    endVertex = [mapboxgl.MercatorCoordinate.fromLngLat([endLon, endLat], altitude * altScale)];
    let tem = [];
    tem.push(
      startVertex[0].x,
      endVertex[0].y,
      startVertex[0].z!,
      0.0,
      1.0,
      startVertex[0].x,
      startVertex[0].y,
      startVertex[0].z!,
      0.0,
      0.0,
      endVertex[0].x,
      endVertex[0].y,
      startVertex[0].z!,
      1.0,
      1.0,
      endVertex[0].x,
      startVertex[0].y,
      startVertex[0].z!,
      1.0,
      0.0
    );

    return new Float32Array(tem);
  }

  render(gl: WebGL2RenderingContext, matrix: any) {
    gl.useProgram(this.program)

    const verticesTexCoords = this.calVerticesTexCoords({
      startLon: 110, startLat: 20, endLon: 120, endLat: 40
    })
    const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vertexTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(0);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
    gl.enableVertexAttribArray(1);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      this.image.width,
      this.image.height,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      this.image
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.uniform1i(gl.getUniformLocation(this.program!, 'uSampler'), 0)

    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program!, 'u_matrix'),
      false,
      matrix
    )
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    this.map?.triggerRepaint()
  }
}
