/*
 * @FilePath: selfPrimitive.ts
 * @Author: @zhangl
 * @Date: 2023-08-17 09:59:39
 * @LastEditTime: 2024-01-03 11:28:41
 * @LastEditors: @zhangl
 * @Description: 自定义几何图形
 */

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
	colorValues: IColorValue
	maxHeight: number
	exaggeration: number
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
		colorValues: {
			num: [1, 3, 5, 7, 9],
			values: [
				'151,232,173',
				'107,157,225',
				'43,92,194',
				'7,30,120',
				'200,17,169',
			],
		},
		maxHeight: 30000,
		exaggeration: 5,
	}
	private drawCommand: any
	private vertexData: Float32Array
	private indexData: Uint16Array
	private colorData: Float32Array

	show: boolean

	/**
	 * @constructor
	 */
	constructor(
		latlons: number[][][] | string[][][],
		options: Partial<IOptions>,
		show: boolean = false
	) {
		this.modelMatrix = Cesium.Matrix4.IDENTITY.clone()
		this.latlons = latlons
		this.options = Object.assign(this.options, options)
		this.show = show

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
		this.calculatPixelLegend()
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
		this.calculatPixelLegend()
	}

	/**
	 * 计算顶点数组
	 */
	private calculatPixelVertex() {
		const { latCount, lonCount, exaggeration } = this.options
		let arr: number[] = []
		let lat, lon, height
		for (let i = 0; i < latCount; ++i) {
			for (let j = 0; j < lonCount; ++j) {
				lat = Number(this.latlons[i][j][0])
				lon = Number(this.latlons[i][j][1])
				height = this.getHeight(Number(this.latlons[i][j][2])) * exaggeration
				const c = Cesium.Cartesian3.fromDegrees(lon, lat, height)
				arr.push(c.x, c.y, c.z)
			}
		}

		this.vertexData = new Float32Array(arr)
	}
	private getHeight(h: number) {
		const { minValue, maxValue, maxHeight } = this.options
		return ((h - minValue) / (maxValue - minValue)) * maxHeight
	}

	/**
	 * 计算顶点索引
	 */
	private calculatPixelIndex() {
		const { latCount, lonCount } = this.options
		let arr: number[] = []
		for (let i = 0; i < latCount - 1; ++i) {
			for (let j = 0; j < lonCount - 1; ++j) {
				arr.push(i * lonCount + j, i * lonCount + j + 1, (i + 1) * lonCount + j)
				arr.push(
					i * lonCount + j + 1,
					(i + 1) * lonCount + j,
					(i + 1) * lonCount + j + 1
				)
			}
		}

		this.indexData = new Uint16Array(arr)
	}

	/**
	 * 计算颜色图例信息
	 */
	private calculatPixelLegend() {
		const ctx = this.createColorLinear()
		let arr: number[] = []
		this.latlons.forEach((lItem) => {
			lItem.forEach((item) => {
				this.getInterpolateColor(item[2], ctx!).forEach(i => {
					arr.push(Number(i) / 255)
				})
				// this.getColor(Number(item[2]))?.forEach((i) => {
				// 	arr.push(Number(i) / 255)
				// })
				// arr.push(1)
			})
		})

		this.colorData = new Float32Array(arr)
	}
	private createColorLinear() {
		const { colorValues } = this.options
		let len = colorValues.num.length
		let min = colorValues.num[0]
		let max = colorValues.num[len - 1]
		console.log(colorValues);

		const canvas = document.createElement("canvas")
		canvas.width = 100
		canvas.height = 1
		let ctx = canvas.getContext('2d', { willReadFrequently: true })
		let grd = ctx!.createLinearGradient(0, 1, 100, 1)
		for (let i = 0; i < len; ++i) {
			let num = (colorValues.num[i] - min) / (max - min)
			grd.addColorStop(num, `rgb(${colorValues.values[i]})`)
			console.log(num, `rgb(${colorValues.values[i]})`);
		}
		ctx!.fillStyle = grd
		ctx!.fillRect(0, 0, 100, 1)
		return ctx
	}
	private getInterpolateColor(val: number | string, ctx: CanvasRenderingContext2D) {
		const { colorValues } = this.options
		let len = colorValues.num.length
		let min = colorValues.num[0]
		let max = colorValues.num[len - 1]

		let num = (Number(val) - min) / (max - min) * 100
		let colorData = ctx.getImageData(num, 0, 1, 1).data
		return [
			colorData[0],
			colorData[1],
			colorData[2],
			colorData[3]
		]
		// return {
		// 	r: colorData[0],
		// 	g: colorData[1],
		// 	b: colorData[2],
		// 	a: colorData[3]
		// }
	}
	/**
	 * 根据数值大小获取颜色值
	 * @param value 数值
	 * @returns
	 */
	private getColor(value: number) {
		const { colorValues } = this.options
		let length = colorValues.num.length
		if (value <= colorValues.num[0]) {
			return colorValues.values[0].split(',')
		}
		if (value >= colorValues.num[length - 1]) {
			return colorValues.values[length - 1].split(',')
		}
		for (let i = 0; i < length - 1; ++i) {
			if (value > colorValues.num[i] && value <= colorValues.num[i + 1]) {
				let minRgb = colorValues.values[i].split(',')
				let maxRgb = colorValues.values[i + 1].split(',')
				return this.rgbLerp(
					value,
					minRgb,
					maxRgb,
					colorValues.num[i],
					colorValues.num[i + 1]
				)
				return colorValues.values[i + 1].split(',')
			}
		}
	}
	/**
	 * 颜色插值
	 * @param value 当前数值
	 * @param minRgb 低颜色值
	 * @param maxRgb 高颜色值
	 * @param min 最小数值
	 * @param max 最大数值
	 * @returns
	 */
	private rgbLerp(
		value: number,
		minRgb: string[],
		maxRgb: string[],
		min: number,
		max: number
	) {
		let factor = (value - min) / (max - min)
		let r = Number(minRgb[0]) + factor * (Number(maxRgb[0]) - Number(minRgb[0]))
		let g = Number(minRgb[1]) + factor * (Number(maxRgb[1]) - Number(minRgb[1]))
		let b = Number(minRgb[2]) + factor * (Number(maxRgb[2]) - Number(minRgb[2]))
		return [r, g, b]
	}

	/**
	 * @param frameState
	 */
	private update(frameState: any) {
		if (!this.show) return
		this.drawCommand = this.createCommand(frameState, this.modelMatrix)
		frameState.commandList.push(this.drawCommand)
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
		// const vertexShaderText = `
		// attribute vec3 position;
		// void main() {
		//   gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
		// }`
		// const fragmentShaderText = `
		// uniform vec3 u_color;
		// void main(){
		//   gl_FragColor = vec4(u_color, 1.0);
		// }`
		const vertexShaderText = `
    attribute vec3 position;
    attribute vec4 color;
    varying vec4 v_color;
    void main() {
      v_color = color;
      gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
    }`
		const fragmentShaderText = `
    varying vec4 v_color;
    void main(){
      gl_FragColor = v_color;
    }`

		const attributeLocations = {
			position: 0,
			normal: 1,
			st: 2,
			bitangent: 3,
			tangent: 4,
			color: 5,
		}
		const uniformMap = {
			// u_color() {
			//   return Cesium.Color.HONEYDEW
			// },
		}

		const positionBuffer = Cesium.Buffer.createVertexBuffer({
			usage: Cesium.BufferUsage.STATIC_DRAW,
			typedArray: this.vertexData,
			context: frameState.context,
		})
		const colorBuffer = Cesium.Buffer.createVertexBuffer({
			usage: Cesium.BufferUsage.STATIC_DRAW,
			typedArray: this.colorData,
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
					index: 0, // 等于 attributeLocations['position']
					vertexBuffer: positionBuffer,
					componentsPerAttribute: 3,
					componentDatatype: Cesium.ComponentDatatype.FLOAT,
				},
				{
					index: 5, // 等于 attributeLocations['position']
					vertexBuffer: colorBuffer,
					componentsPerAttribute: 4,
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
