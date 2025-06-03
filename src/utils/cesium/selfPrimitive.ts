/*
 * @FilePath: selfPrimitive.ts
 * @Author: @zhangl
 * @Date: 2023-08-17 09:59:39
 * @LastEditTime: 2024-07-01 18:07:24
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
	imgList: string[]
	minLon: number
	maxLon: number
	minLat: number
	maxLat: number
}

const faceNum = {
	x: 90,
	y: 45
	// x: 60,
	// y: 30
}

/**
 * @class 自定义几何图形
 */
export class SelfPrimitive {
	private modelMatrix: Cesium.Matrix4
	private latlons: number[][][] | string[][][]
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
		imgList: [],
		minLon: -180,
		maxLon: 180,
		minLat: -90,
		maxLat: 90
	}
	minV: number = Number.MIN_SAFE_INTEGER
	maxV: number = Number.MAX_SAFE_INTEGER
	private drawCommand: any
	private vertexData: Float32Array
	private indexData: Uint16Array
	private verticesTexCoords: Float32Array
	private texture: Cesium.Texture
	private image: string

	private legendColor: Float32Array
	private legendValue: Float32Array

	private legend: {
		canvas: HTMLCanvasElement
		colorRange: number[]
	}

	show: boolean = true
	private imgLoading: boolean = false

	/**
	 * @constructor
	 */
	constructor(
		options: Partial<IOptions>
	) {
		this.modelMatrix = Cesium.Matrix4.IDENTITY.clone()
		this.options = Object.assign(this.options, options)

		this.calculatData()
	}

	/**
	 * 设置新的经纬度数据
	 * @param latlons 经纬度数据
	 */
	setData(latlons: number[][][] | string[][][], options?: IOptions) {
		this.latlons = latlons
		if (options) {
			this.options = Object.assign(this.options, options)
		}
		this.calculatData()
	}

	/**
	 * 重新设置颜色图例
	 * @param colorValues 颜色图例
	 */
	setColorValues(colorValues: IColorValue) {
		this.options.colorValues = colorValues
		// this.calculatPixelLegend()
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

	setExtentV(min: number, max: number) {
		this.minV = min
		this.maxV = max
	}

	// 合并图片
	async mergeImages(imgList: any[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, frameState: any) {
		return await new Promise(resolve => {
			// 设置Canvas的大小
			let width = 0;
			let height = 0;
			let imgLength = 0
			imgList.forEach((img, index) => {
				imgList[index].onload = () => {
					// 计算总宽度和高度
					width += img.width
					height = Math.max(height, img.height)
					++imgLength
					// 所有图片都加载完毕后绘制
					if (imgList.length === imgLength) {
						canvas.width = width
						canvas.height = height

						let x = 0
						imgList.forEach((img, index) => {
							ctx.drawImage(img, x, (height - img.height) / 2)
							x += img.width
						})
						// canvas.toDataURL()
						let dataURL = canvas.toDataURL()

						let a = document.createElement('a')
						let event = new MouseEvent('click')
						a.download = `a.png`
						a.href = dataURL
						a.dispatchEvent(event)
						a.remove()

						const texture = new Cesium.Texture({
							context: frameState.context,
							source: canvas.toDataURL()
						})

						this.imgLoading = false
						resolve(texture)
					}
				}
			})
		})
	}
	async createImage(frameState: any) {
		this.imgLoading = true
		// 创建Canvas元素
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')

		// 加载所有图片
		const images = this.options.imgList.map(url => {
			const img = new Image()
			img.src = url
			return img
		})

		const texture = await this.mergeImages(images, canvas, ctx!, frameState)

		console.log(texture, '------');
		return texture
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
		const { exaggeration, minLat, minLon, maxLat, maxLon } = this.options
		let xOffset = (maxLon - minLon) / faceNum.x
		let yOffset = (maxLat - minLat) / faceNum.y
		let arr: number[] = []
		let lat, lon, height
		let latlon: number[] = []
		let hLength = this.options.imgList.length
		for (let h = 0; h < hLength; ++h) {
			height = h * 150000
			for (let i = 0; i <= faceNum.y; ++i) {
				lat = minLat + i * yOffset
				for (let j = 0; j <= faceNum.x; ++j) {
					lon = minLon + j * xOffset
					const c = Cesium.Cartesian3.fromDegrees(lon, lat, height)
					arr.push(c.x, c.y, c.z)
					latlon.push(lat, lon)
				}
			}
		}
		this.vertexData = new Float32Array(arr)
	}

	/**
	 * 计算顶点索引
	 */
	private calculatPixelIndex() {
		let arr: number[] = []
		let hLength = this.options.imgList.length
		let hCount = 0
		for (let h = 0; h < hLength; ++h) {
			hCount = h * (faceNum.y + 1) * (faceNum.x + 1)
			for (let i = 0; i < faceNum.y; ++i) {
				for (let j = 0; j < faceNum.x; ++j) {
					arr.push(hCount + i * (faceNum.x + 1) + j, hCount + i * (faceNum.x + 1) + j + 1, hCount + (i + 1) * (faceNum.x + 1) + j)
					arr.push(
						hCount + i * (faceNum.x + 1) + j + 1,
						hCount + (i + 1) * (faceNum.x + 1) + j,
						hCount + (i + 1) * (faceNum.x + 1) + j + 1
					)
				}
			}
		}

		this.indexData = new Uint16Array(arr)
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
	}

	/**
	 *
	 * 计算纹理坐标，左上，左下，右上，右下
	 * @returns
	 * @memberof GridLayer
	 */
	calVerticesTexCoords() {
		const { latCount, lonCount } = this.options
		let arr: number[] = []
		let hLength = this.options.imgList.length
		for (let h = 0; h < hLength; ++h) {

			for (let i = 0; i < faceNum.y + 1; ++i) {
				for (let j = 0; j < faceNum.x + 1; ++j) {
					arr.push(j / faceNum.x)
					arr.push(i / faceNum.y)
				}
				// for (let j = 0; j < faceNum.x + 1; ++j) {
				// 	arr.push((j + (faceNum.x + 1 * h)) / (faceNum.x + 1 * hLength))
				// 	arr.push(i / faceNum.y)
				// }
			}
		}
		this.verticesTexCoords = new Float32Array(arr)
	}

	/**
	 * @param frameState
	 */
	private update(frameState: any) {
		if (!this.show) return

		if (!this.drawCommand) {
			this.drawCommand = this.createCommand(frameState, this.modelMatrix)
		}

		if (!this.texture) {
			if (!this.options.imgList.length) return

			// if (!this.imgLoading) {
			// 	this.texture = this.createImage(frameState)
			// }
			let img = new Image()
			img.src = this.options.imgList[0]
			img.onload = () => {
				this.texture = new Cesium.Texture({
					context: frameState.context,
					source: img
				})
			}
		}

		frameState.commandList.push(this.drawCommand)
	}

	isDestroyed() {
	}

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
			uniform float u_min;
			uniform float u_max;
			void main(){
				// vec4 val = texture2D(u_texture, v_st);
				// float trueVal = (val.g) * 10.0 + (val.b) / 10.0;
				// if (int(val.r) == 0) {
				// 	trueVal = -trueVal;
				// }
				float val = texture2D(u_texture, v_st).r;
				float trueVal = val * (u_range.y - u_range.x) + u_range.x;
				if (trueVal >= u_min && trueVal <= u_max) {
					vec4 renderColor = vec4(u_legend[0], u_legend[1], u_legend[2], u_legend[3]);
					if(trueVal <= u_legendv[0]){
						gl_FragColor = renderColor;
						return;
					}
					if (trueVal > u_legendv[${this.legendValue.length - 1}]) {
						gl_FragColor = vec4(u_legend[${this.legendColor.length - 4}], u_legend[${this.legendColor.length - 3}], u_legend[${this.legendColor.length - 2}], u_legend[${this.legendColor.length - 1}]);
						return;
					}
					for (int i = 1; i < ${this.legendValue.length}; i++) {
						if(trueVal >= u_legendv[i-1] && trueVal < u_legendv[i]) {
							renderColor = vec4(u_legend[(i-1) * 4 + 0], u_legend[(i-1) * 4 + 1], u_legend[(i-1) * 4 + 2], u_legend[(i-1) * 4 + 3]);
							break;
						}
					}
					gl_FragColor = vec4(renderColor.rgb, 0.9);
					// czm_gl_FragColor = renderColor;
					// gl_FragColor = vec4(val, texture2D(u_texture, v_st).gba);
				}
			}`

		const attributeLocations = {
			position: 0,
			st: 1,
			color: 2,
		}
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
			// 灰度图数据范围
			u_range: () => {
				return new Cesium.Cartesian2(this.options.minValue, this.options.maxValue)
			},
			u_legend: () => {
				return this.legendColor
			},
			u_legendv: () => {
				return this.legendValue
			},
			u_min: () => {
				return this.minV
			},
			u_max: () => {
				return this.maxV
			}
		}

		const positionBuffer = Cesium.Buffer.createVertexBuffer({
			usage: Cesium.BufferUsage.STATIC_DRAW,
			typedArray: this.vertexData,
			context: frameState.context,
		})
		const stBuffer = Cesium.Buffer.createVertexBuffer({
			usage: Cesium.BufferUsage.STATIC_DRAW,
			typedArray: this.verticesTexCoords,
			context: frameState.context,
		})
		const indexBuffer = Cesium.Buffer.createIndexBuffer({
			usage: Cesium.BufferUsage.STATIC_DRAW,
			typedArray: this.indexData,
			context: frameState.context,
			indexDatatype: Cesium.ComponentDatatype.UNSIGNED_SHORT,
		})
		const vertexArray = new Cesium.VertexArray({
			context: frameState.context,
			attributes: [
				{
					index: 0,
					vertexBuffer: positionBuffer,
					componentsPerAttribute: 3,
					componentDatatype: Cesium.ComponentDatatype.FLOAT,
				},
				{
					index: 1,
					vertexBuffer: stBuffer,
					componentsPerAttribute: 2,
					componentDatatype: Cesium.ComponentDatatype.FLOAT,
				},
			],
			indexBuffer,
		})
		const program = Cesium.ShaderProgram.fromCache({
			context: frameState.context,
			vertexShaderSource: vertexShaderText,
			fragmentShaderSource: fragmentShaderText,
			attributeLocations: attributeLocations,
		})
		const renderState = Cesium.RenderState.fromCache({
			blending: Cesium.BlendingState.ALPHA_BLEND,
			depthTest: {
				enabled: true,
			},
		})

		return new Cesium.DrawCommand({
			modelMatrix: matrix,
			vertexArray: vertexArray,
			shaderProgram: program,
			uniformMap: uniformMap,
			renderState: renderState,
			pass: Cesium.Pass.OPAQUE,
		})
	}
}
