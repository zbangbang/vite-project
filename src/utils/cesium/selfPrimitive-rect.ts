/*
 * @FilePath: selfPrimitive-rect.ts
 * @Author: @zhangl
 * @Date: 2023-08-17 09:59:39
 * @LastEditTime: 2024-07-01 11:37:25
 * @LastEditors: @zhangl
 * @Description: 自定义几何图形
 */
import * as Cesium from 'cesium'

interface IColorValue {
	num: number[]
	values: string[]
}

/**
 * @param latCount 纬度个数
 * @param lonCount 经度个数
 * @param maxValue 数据最大值
 * @param minValue 数据最小值
 * @param colorValues 颜色图例
 * @param maxHeight 最大高度，用于计算数值对应高度值
 * @param exaggeration 高度夸张倍数
 */
interface IOptions {
	latCount: number
	lonCount: number
	maxValue: number
	minValue: number
	colorList: number[][]
	valueList: number[]
	maxHeight: number
	exaggeration: number
	image: string
	minLon: number
	maxLon: number
	minLat: number
	maxLat: number
}

/**
 * @class 自定义几何图形
 */
export class SelfPrimitive {
	private modelMatrix: Cesium.Matrix4
	private options: IOptions = {
		latCount: 0,
		lonCount: 0,
		maxValue: 9,
		minValue: 1,
		colorList: [
			[115, 70, 105, 1],
			[202, 172, 195, 1],
			[162, 70, 145, 1],
			[143, 89, 169, 1],
			[157, 219, 217, 1],
			[106, 191, 181, 1],
			[100, 166, 189, 1],
			[93, 133, 198, 1],
			[68, 125, 99, 1],
			[128, 147, 24, 1],
			[243, 183, 4, 1],
			[232, 83, 25, 1],
			[71, 14, 0, 1]
		],
		valueList: [
			-70.15, -55.15, -40.15, -25.15, -15.15, -8.15, -4.15, 0, 0.85, 9.85, 20.85, 29.85, 46.85
		],
		maxHeight: 30000,
		exaggeration: 5,
		image: '',
		minLon: 0,
		maxLon: 360,
		minLat: -90,
		maxLat: 90
	}
	private drawCommand: any
	private vertexData: Float32Array
	private vertexArray: any
	private attributeLocations: any
	private indexData: Uint16Array
	private colorData: Float32Array
	private verticesTexCoords: Float32Array
	private texture: Cesium.Texture
	private legend: {
		canvas: HTMLCanvasElement
		colorRange: number[]
	}
	private legendColor: Float32Array
	private legendValue: Float32Array

	show: boolean
	private imgChange: boolean = false

	/**
	 * @constructor
	 */
	constructor(
		options: Partial<IOptions>,
		show: boolean = false
	) {
		// const modelCenter = Cesium.Cartesian3.fromDegrees(110, 40, 0)
		// this.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter)
		this.modelMatrix = Cesium.Matrix4.IDENTITY.clone()
		this.options = Object.assign(this.options, options)
		this.show = show

		console.log(this.options, 'options');

		this.calculatData()
	}

	/**
	 * 设置新的经纬度数据
	 * @param latlons 经纬度数据
	 */
	setData(options?: IOptions) {
		if (options) {
			this.options = Object.assign(this.options, options)
		}
		this.calculatData()
	}

	/**
	 * @Date: 2024-07-01 10:55:52
	 * @Description: 设置新的图片
	 * @param {string} image
	 * @return {*}
	 */
	setImage(image: string) {
		this.options.image = image
		this.imgChange = true
	}

	/**
	 * 重新设置颜色图例
	 * @param colorValues 颜色图例
	 */
	setColorValues(colorValues: IColorValue) {
		this.options.colorValues = colorValues
	}

	/**
	 * @Date: 2023-08-30 14:30:26
	 * @Description: 根据所给的中心点，计算当前primitive的范围
	 * @param {Cesium.Cartesian3} center
	 * @return {*}
	 */
	getBoundingSphere(center: Cesium.Cartesian3 = Cesium.Cartesian3.ZERO) {
		return Cesium.BoundingSphere.fromVertices(
			Array.from(this.vertexData),
			center,
			3
		)
	}

	/**
	 * 计算所需的数据
	 */
	private calculatData() {
		this.calculatPixelVertex()
		this.calculatPixelIndex()
		this.createColorLinear()
		this.calVerticesTexCoords()
	}

	/**
	 * 计算顶点数组
	 */
	private calculatPixelVertex() {
		let { minLon, maxLon, minLat, maxLat } = this.options
		let altitude = 1
		let altScale = 1
		const lt = Cesium.Cartesian3.fromDegrees(minLon, maxLat, altitude * altScale)
		const rt = Cesium.Cartesian3.fromDegrees(maxLon, maxLat, altitude * altScale)
		const rb = Cesium.Cartesian3.fromDegrees(maxLon, minLat, altitude * altScale)
		const lb = Cesium.Cartesian3.fromDegrees(minLon, minLat, altitude * altScale)

		this.vertexData = new Float32Array([
			lt.x,
			lt.y,
			lt.z,
			rt.x,
			rt.y,
			rt.z,
			lb.x,
			lb.y,
			lb.z,
			rb.x,
			rb.y,
			rb.z,
		])
	}

	/**
	 * 计算顶点索引
	 */
	private calculatPixelIndex() {
		this.indexData = new Uint16Array([
			0, 1, 2,
			1, 2, 3
		])
	}

	/**
	 * @Date: 2024-01-11 14:10:33
	 * @Description: 创建渐变纹理
	 * @return {*}
	 */
	private createColorLinear() {
		const { colorList, valueList } = this.options
		let len = valueList.length
		let min = valueList[0]
		let max = valueList[len - 1]
		let arr1 = []
		let arr2 = []

		const canvas = document.createElement("canvas")
		canvas.width = 256
		canvas.height = 1
		let ctx = canvas.getContext('2d', { willReadFrequently: true })
		let grd = ctx!.createLinearGradient(0, 1, 100, 1)
		for (let i = 0; i < len; ++i) {
			let num = (valueList[i] - min) / (max - min)
			grd.addColorStop(num, `rgb(${colorList[i].join(',')})`)

			arr1.push(valueList[i])
			arr2.push(...colorList[i].map(item => Number(item) / 255))
		}
		ctx!.fillStyle = grd
		ctx!.fillRect(0, 0, 256, 1)
		this.legend = {
			canvas: canvas,
			colorRange: [min, max],
		}

		this.legendColor = new Float32Array(arr2)
		this.legendValue = new Float32Array(arr1)

		// console.log(this.legendColor);
		// console.log(this.legendValue);
	}

	/**
	 *
	 * 计算纹理坐标，左上，左下，右上，右下
	 * @returns
	 * @memberof GridLayer
	 */
	calVerticesTexCoords() {
		this.verticesTexCoords = new Float32Array([
			0.0,
			1.0,
			1.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
		])
	}

	/**
	 * @param frameState
	 */
	private update(frameState: any) {
		if (!this.show) return
		this.drawCommand = this.createCommand(frameState, this.modelMatrix)

		if (!this.texture || this.imgChange) {
			if (!this.options.image) return

			let img = new Image()
			img.src = this.options.image
			img.onload = () => {
				this.texture = new Cesium.Texture({
					context: frameState.context,
					source: img
				})
			}
			this.imgChange = false
		}

		frameState.commandList.push(this.drawCommand)
	}

	isDestroyed() { }

	destroy() {
		if (this.drawCommand) {
			let va = this.drawCommand.vertexArray,
				sp = this.drawCommand.shaderProgram
			if (!va.isDestroyed()) va.destroy()
			if (!sp.isDestroyed || !sp.isDestroyed()) {
				sp.destroy()
			}
			this.drawCommand.isDestroyed = function returnTrue() {
				return true
			}
			this.drawCommand.uniformMap = undefined
			this.drawCommand.renderState = Cesium.RenderState.removeFromCache(
				this.drawCommand.renderState
			)
			this.drawCommand = null
		}
	}

	/**
	 * @Date: 2023-08-21 10:14:26
	 * @Description: createCommand
	 * @param {any} frameState
	 * @param {Cesium} matrix
	 * @return {*}
	 */
	private createCommand(frameState: any, matrix: Cesium.Matrix4) {
		// const vertexShaderText = `
		// attribute vec3 position;
		// attribute vec2 st;
		// varying vec2 v_st;
		// void main() {
		// 	v_st = st;
		//   gl_Position = czm_modelViewProjection * vec4(position, 1.0);
		// }`
		// const fragmentShaderText = `
		// precision mediump float;
		// varying vec2 v_st;
		// uniform sampler2D u_texture;
		// uniform sampler2D color_ramp;
		// uniform vec2 u_image_res;
		// uniform vec2 u_range;
		// uniform vec2 u_color_range;

		// float calcTexture(sampler2D tex, const vec2 uv) {
		// 	return texture2D(tex, uv).r;
		// }

		// float bilinear(sampler2D tex, const vec2 uv) {
		// 	vec2 px = 1.0 / u_image_res;
		// 	// floor 向下取整
		// 	vec2 vc = (floor(uv * u_image_res)) * px;
		// 	// fract 返回小数部分
		// 	vec2 f = fract(uv * u_image_res);
		// 	float tl = calcTexture(tex, vc);
		// 	float tr = calcTexture(tex, vc + vec2(px.x, 0));
		// 	float bl = calcTexture(tex, vc + vec2(0, px.y));
		// 	float br = calcTexture(tex, vc + px);
		// 	// mix(x, y, a): x * (1-a) + y * a // 第三个参数恒为float
		// 	return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);
		// }

		// float getValue(sampler2D tex, const vec2 uv) {
		// 	float min = u_range.x;
		// 	float max = u_range.y;
		// 	float r = bilinear(tex, uv);
		// 	return r * (max - min) + min;
		// }


		// void main(){
		// 	czm_materialInput materialInput;
		// 	materialInput.st = v_st;
		// 	czm_material material = czm_getDefaultMaterial(materialInput);
		// 	// material.diffuse = texture2D(u_texture, materialInput.st).rgb;

		// 	float value = getValue(u_texture, materialInput.st);
		// 	float value_t = (value - u_color_range.x) / (u_color_range.y - u_color_range.x);

		// 	vec4 color = texture2D(color_ramp, vec2(value_t, 0.5));

		// 	color = czm_gammaCorrect(color);
		// 	material.diffuse = color.rgb;
		// 	material.alpha = color.a;

		// 	gl_FragColor = vec4(material.diffuse, material.alpha);
		// 	// gl_FragColor = texture2D(u_texture, v_st);
		// }`

		const vertexShaderText = `
		attribute vec3 position;
		attribute vec2 st;
		varying vec2 v_st;
		uniform mat3 u_m3;
		void main() {
			v_st = st;
			vec3 pos = position * u_m3;
		  gl_Position = czm_modelViewProjection * vec4(pos, 1.0);
		}`
		const fragmentShaderText = `
		precision highp float;
		varying vec2 v_st;
		uniform sampler2D u_texture;
		uniform float u_legend[${this.legendColor.length}];
		uniform float u_legendv[${this.legendValue.length}];
		uniform vec2 u_range;
		void main(){
			float val = texture2D(u_texture, v_st).r;
			// float trueVal = 20.0;
			float trueVal = val * (u_range.y - u_range.x) + u_range.x;
			vec4 renderColor = vec4(u_legend[0], u_legend[1], u_legend[2], u_legend[3]);
			if(trueVal <= u_legendv[0]){
				czm_gl_FragColor = renderColor;
				return;
			}
			if (trueVal > u_legendv[${this.legendValue.length - 1}]) {
				czm_gl_FragColor = vec4(u_legend[${this.legendColor.length - 4}], u_legend[${this.legendColor.length - 3}], u_legend[${this.legendColor.length - 2}], u_legend[${this.legendColor.length - 1}]);
				return;
			}
			for (int i = 1; i < ${this.legendValue.length}; i++) {
				if(trueVal >= u_legendv[i-1] && trueVal < u_legendv[i]) {
					renderColor = vec4(u_legend[(i-1) * 4 + 0], u_legend[(i-1) * 4 + 1], u_legend[(i-1) * 4 + 2], u_legend[(i-1) * 4 + 3]);
					break;
				}
			}
			czm_gl_FragColor = renderColor;
			// gl_FragColor = vec4(val, texture2D(u_texture, v_st).gba);
		}`

		const uniformMap = {
			u_m3: () => {
				return new Float32Array([
					1.0, 0.0, 0.0,
					0.0, 1.0, 0.0,
					0.0, 0.0, 1.0
				])
			},
			u_texture: () => {
				if (!this.texture) {
					return frameState.context.defaultTexture
				}
				return this.texture
			},
			// 映射纹理
			color_ramp: () => {
				return this.legend.canvas
			},
			// 灰度图数据范围
			u_range: () => {
				return new Cesium.Cartesian2(this.options.minValue, this.options.maxValue)
			},
			// 灰度图分辨率
			u_image_res: () => {
				return new Cesium.Cartesian2(this.options.lonCount, this.options.latCount)
			},
			// 映射的颜色值域范围
			u_color_range: () => {
				return new Cesium.Cartesian2(this.legend.colorRange[0], this.legend.colorRange[1])
			},
			u_legend: () => {
				return this.legendColor
			},
			u_legendv: () => {
				return this.legendValue
			},
		}

		if (!this.vertexArray) {
			const rectangle = new Cesium.RectangleGeometry({
				ellipsoid: Cesium.Ellipsoid.WGS84,
				height: 0.0,
				rectangle: Cesium.Rectangle.fromDegrees(
					this.options.minLon,
					this.options.minLat,
					this.options.maxLon,
					this.options.maxLat
				),
				vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
			})

			const reactgeometry = Cesium.RectangleGeometry.createGeometry(rectangle)
			this.attributeLocations = Cesium.GeometryPipeline.createAttributeLocations(reactgeometry!)
			this.vertexArray = Cesium.VertexArray.fromGeometry({
				context: frameState.context,
				geometry: reactgeometry,
				attributeLocations: this.attributeLocations
			})
		}

		const program = Cesium.ShaderProgram.fromCache({
			context: frameState.context,
			vertexShaderSource: vertexShaderText,
			fragmentShaderSource: fragmentShaderText,
			attributeLocations: this.attributeLocations,
		})
		const renderState = Cesium.RenderState.fromCache({
			depthTest: {
				enabled: true,
			},
		})

		return new Cesium.DrawCommand({
			modelMatrix: matrix,
			vertexArray: this.vertexArray,
			shaderProgram: program,
			uniformMap: uniformMap,
			renderState: renderState,
			pass: Cesium.Pass.TRANSLUCENT,
		})
	}
}
