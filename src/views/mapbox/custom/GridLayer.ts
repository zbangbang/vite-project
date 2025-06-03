/*
 * @FilePath: GridLayer.ts
 * @Author: @zhangl
 * @Date: 2024-09-25 16:20:35
 * @LastEditTime: 2024-09-29 23:39:11
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
  private readBack: Function
  private frameBuffer: WebGLFramebuffer | null = null

  constructor(tData: ISourceData, options: any) {
    this.id = 'customLayerId'
    this.type = 'custom'
    this.renderingMode = '3d'
    this.image = tData[0]
    this.data = tData
    this.levelList = [1, 5000, 10000, 15000]
    this.textureDataInfo = this.createImageInfo()
    this.readBack = options.readBack
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
	    out vec3 v_Position;
      uniform mat4 u_matrix;
      void main() {
        vTexCoord = aTexCoord;
        v_Position = a_pos;
        gl_Position = u_matrix * vec4(a_pos, 1.0);
        gl_PointSize = 20.0;
      }`

    const fragmentSource = `#version 300 es
      precision highp float;
      #define PI 3.1415926535897932384626433832795
      #define earthCircumference 2.0 * PI * 6371008.8
      precision highp sampler3D;
      in vec2 vTexCoord;
      out vec4 fragColor;
      uniform sampler3D u_Sampler;
      uniform float u_index;
      uniform vec3 u_Start;
      uniform vec3 u_End;
      in vec3 v_Position;

      vec3 mkt2lonlat(vec3 mkt){
        float lon = mkt.x * 360.0 - 180.0;
        float y2 = 180.0 - mkt.y * 360.0;
        float lat =  360.0 / PI * atan(exp(y2 * PI / 180.0)) - 90.0;
        float height = mkt.z * earthCircumference * cos(lat * PI / 180.0);
        return vec3(lon, lat, height);
      }

      void main() {
        vec3 current = mkt2lonlat(v_Position);
        vec3 xyz = (current - u_Start) / (u_End - u_Start);
        vec4 rgb2 = texture(u_Sampler, xyz);
        fragColor = rgb2;
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
    let levelList = this.levelList;
    altitude = altitude ?? 1;
    altScale = altScale ?? 1;
    let startVertex: MercatorCoordinate[] = [];
    let endVertex: MercatorCoordinate[] = [];
    if (levelList && levelList.length) {
      for (let i = 0, len = levelList.length; i < len; i++) {
        startVertex.push(mapboxgl.MercatorCoordinate.fromLngLat([startLon, startLat], altitude + levelList[i] * altScale));
        endVertex.push(mapboxgl.MercatorCoordinate.fromLngLat([endLon, endLat], altitude + levelList[i] * altScale));
      }
    } else {
      startVertex = [mapboxgl.MercatorCoordinate.fromLngLat([startLon, startLat], altitude * altScale)];
      endVertex = [mapboxgl.MercatorCoordinate.fromLngLat([endLon, endLat], altitude * altScale)];
    }
    let tem = [];
    for (let i = 0, len = startVertex.length; i < len; i++) {
      tem.push(
        startVertex[i].x,
        endVertex[i].y,
        startVertex[i].z!,
        0.0,
        1.0,
        startVertex[i].x,
        startVertex[i].y,
        startVertex[i].z!,
        0.0,
        0.0,
        endVertex[i].x,
        endVertex[i].y,
        startVertex[i].z!,
        1.0,
        1.0,
        endVertex[i].x,
        startVertex[i].y,
        startVertex[i].z!,
        1.0,
        0.0
      );
    }

    // console.log(tem, 'tem');

    return new Float32Array(tem);
  }

  render(gl: WebGL2RenderingContext, matrix: any) {
    gl.useProgram(this.program)

    const startLat = 20
    const endLat = 40
    const startLon = 110
    const endLon = 120
    const altitude = 0
    const altScale = 100
    const verticesTexCoords = this.calVerticesTexCoords({
      startLon, startLat, endLon, endLat, altitude: 0, altScale: 100
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

    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program!, 'u_matrix'),
      false,
      matrix
    )


    const { width, height, imageBuffer } = this.textureDataInfo!
    //灰度图
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texture);

    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texStorage3D(gl.TEXTURE_3D, 1, gl.RGBA8, width, height, this.data.length);

    for (var i = 0; i < imageBuffer.length; ++i) {
      gl.texSubImage3D(
        gl.TEXTURE_3D,
        0,
        0,
        0,
        i,
        width,
        width,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageBuffer[i]
      );
    }

    gl.uniform1i(gl.getUniformLocation(this.program!, 'uSampler'), 0)

    const u_index = gl.getUniformLocation(this.program!, 'u_index')
    const heights = [this.levelList[0] * 100, this.levelList[this.levelList.length - 1] * 100]
    // gl.uniform1fv(gl.getUniformLocation(this.program!, 'u_heights[0]'), heights)
    gl.uniform3fv(gl.getUniformLocation(this.program!, 'u_Start'), [startLon, startLat, altitude])
    gl.uniform3fv(gl.getUniformLocation(this.program!, 'u_End'), [endLon, endLat, altitude + this.levelList[this.levelList.length - 1] * altScale])
    // console.log(heights, 'heights');


    if (this.levelList && this.levelList.length) {
      for (let i = 0, len = this.data.length; i < len; i++) {
        gl.uniform1f(u_index, i)
        gl.drawArrays(gl.TRIANGLE_STRIP, i * 4, 4);
      }
    } else {
      console.error(`levelList 字段不能为空！`);
    }

    this.createFbo(gl)
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    this.map?.triggerRepaint()
  }

  createFbo(gl: WebGL2RenderingContext) {
    if (this.frameBuffer) return
    const { width, height, imageBuffer } = this.textureDataInfo!
    const texture = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)


    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      width,
      height,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      imageBuffer[0]
    )



    this.frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)


    this.readData(gl)
  }

  readData(gl: WebGL2RenderingContext) {
    const { width, height, imageBuffer } = this.textureDataInfo!
    let pixels = new Uint8Array(width * height * 4) // 储存像素的数组


    const startLat = 20
    const endLat = 40
    const startLon = 110
    const endLon = 120
    const altitude = 0
    const altScale = 100
    let vec: mapboxgl.MercatorCoordinate
    this.map?.on('mousemove', e => {
      console.log(e);
      // vec = mapboxgl.MercatorCoordinate.fromLngLat([e.lngLat.lng, e.lngLat.lat], altitude + this.levelList[0] * altScale)
      // gl.readPixels(vec.x, vec.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

      let lat = (e.lngLat.lat - startLat) / (endLat - startLat)
      let lon = (e.lngLat.lng - startLon) / (endLon - startLon)
      console.log(vec);

      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      console.log(pixels);
      this.readBack(pixels)
    })
    // gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  }
}
