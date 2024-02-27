<template>
	<div class="gl_content">
		<div class="left_btn">
			<div
				v-for="(item, index) in glBtnList"
				:key="index"
				:class="{ btn: true, btn_active: item.active }"
				@click.stop="chooseDrawItem(item, index)"
			>
				{{ item.label }}
			</div>
		</div>
		<canvas class="right_content" id="webgl-canvas"></canvas>
		<SliderVue
			class="absolute right-6 top-16 w-100"
			v-model:x="xValue"
			:x-range="xRange"
			v-model:y="yValue"
			:y-range="yRange"
			v-model:r="rotate"
			v-model:sx="xScale"
			:sx-range="sxRange"
			v-model:sy="yScale"
			:sy-range="syRange"
		></SliderVue>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { TrangleShader, PixelTrangleShader } from '@/shader/glNew'
import { TexCoordShader } from '@/shader/glTex'
import useWebGL from '@/hooks/useWebGL/index'
import texImg from '@/assets/images/tex.png'
import SliderVue from '@/components/slider/index.vue'
import { onMounted } from 'vue'

const { initShaders, gl } = useWebGL('webgl-canvas')

const glBtnList = ref([
	{
		label: '三角形',
		value: 'Trangle',
		active: false,
	},
	{
		label: '三角形(像素位置)',
		value: 'PixelTrangle',
		active: false,
	},
	{
		label: '材质',
		value: 'TexCoord',
		active: false,
	},
])

// 选择按钮
const chooseDrawItem = (item: any, index: number) => {
	clearAll()
	if (item.active) {
		item.active = false
		return
	} else {
		glBtnList.value.forEach((btn) => (btn.active = false))
		item.active = true
	}

	switch (item.value) {
		case 'Trangle':
			drawTrangle()
			break
		case 'PixelTrangle':
			drawPixelTrangle()
			break
		case 'TexCoord':
			drawTexCoord()
			break

		default:
			break
	}
}
const clearAll = () => {
	gl.value!.clearColor(1.0, 1.0, 1.0, 1.0)
	gl.value!.clear(gl.value!.COLOR_BUFFER_BIT)
}

// 改变三角形位置等信息
const xValue = ref(175)
const xRange = ref<[number, number]>([0, 1000])
const yValue = ref(100)
const yRange = ref<[number, number]>([0, 1000])
const rotate = ref(0)
const rRange = ref<[number, number]>([0, 360])
const xScale = ref(1)
const sxRange = ref<[number, number]>([0, 5])
const yScale = ref(1)
const syRange = ref<[number, number]>([0, 5])
onMounted(() => {
	xRange.value = [0, (gl.value!.canvas as HTMLCanvasElement).clientWidth]
	yRange.value = [0, (gl.value!.canvas as HTMLCanvasElement).clientHeight]
})
watch(
	[
		() => xValue.value,
		() => yValue.value,
		() => xScale.value,
		() => yScale.value,
		() => rotate.value,
	],
	([xValue, yValue, xScale, yScale, rotate]) => {
		reDrawTrangle()
	}
)

let u_Matrix: any = null
let a_Position: any = null
// 绘制三角形
const drawTrangle = () => {
	let program = initShaders(
		gl.value!,
		TrangleShader.vertexShaderSource,
		TrangleShader.fragmentShaderSource
	)!

	let posArr = new Float32Array([
		0, -100, 1.0, 0.0, 0.0, 150, 125, 0.0, 1.0, 0.0, -175, 100, 0.0, 0.0, 1.0,
	])
	const FSIZE = posArr.BYTES_PER_ELEMENT

	let matrix = m3.projection(
		(gl.value!.canvas as HTMLCanvasElement).clientWidth,
		(gl.value!.canvas as HTMLCanvasElement).clientHeight
	)
	matrix = m3.translate(matrix, xValue.value, yValue.value)
	matrix = m3.rotate(matrix, (rotate.value / 180) * Math.PI)
	matrix = m3.scale(matrix, xScale.value, yScale.value)
	u_Matrix = gl.value!.getUniformLocation(program, 'u_Matrix')
	gl.value!.uniformMatrix3fv(u_Matrix, false, matrix)

	let a_Color = gl.value!.getAttribLocation(program, 'a_Color')
	let colorBuffer = gl.value!.createBuffer()
	gl.value!.bindBuffer(gl.value!.ARRAY_BUFFER, colorBuffer)
	gl.value!.bufferData(gl.value!.ARRAY_BUFFER, posArr, gl.value!.STATIC_DRAW)
	gl.value!.vertexAttribPointer(
		a_Color,
		3,
		gl.value!.FLOAT,
		false,
		FSIZE * 5,
		FSIZE * 2
	)
	gl.value!.enableVertexAttribArray(a_Color)

	a_Position = gl.value!.getAttribLocation(program, 'a_Position')
	let posBuffer = gl.value!.createBuffer()
	gl.value!.bindBuffer(gl.value!.ARRAY_BUFFER, posBuffer)
	gl.value!.bufferData(gl.value!.ARRAY_BUFFER, posArr, gl.value!.STATIC_DRAW)
	gl.value!.vertexAttribPointer(
		a_Position,
		2,
		gl.value!.FLOAT,
		false,
		FSIZE * 5,
		0
	)
	gl.value!.enableVertexAttribArray(a_Position)

	gl.value!.clearColor(0, 0, 0, 0)
	gl.value!.clear(gl.value!.COLOR_BUFFER_BIT)
	gl.value!.drawArrays(gl.value!.TRIANGLES, 0, 3)
}
/**
 * @Date: 2024-02-26 14:06:59
 * @Description: 重新绘制
 * @return {*}
 */
const reDrawTrangle = () => {
	let matrix = m3.projection(
		(gl.value!.canvas as HTMLCanvasElement).clientWidth,
		(gl.value!.canvas as HTMLCanvasElement).clientHeight
	)
	matrix = m3.translate(matrix, xValue.value, yValue.value)
	matrix = m3.rotate(matrix, (rotate.value / 180) * Math.PI)
	matrix = m3.scale(matrix, xScale.value, yScale.value)
	gl.value!.uniformMatrix3fv(u_Matrix, false, matrix)

	gl.value!.clearColor(0, 0, 0, 0)
	gl.value!.clear(gl.value!.COLOR_BUFFER_BIT)
	gl.value!.drawArrays(gl.value!.TRIANGLES, 0, 3)
}

/**
 * @Date: 2024-02-21 17:53:20
 * @Description: 像素位置绘制三角形
 * @return {*}
 */
const drawPixelTrangle = () => {
	let program = initShaders(
		gl.value!,
		PixelTrangleShader.vertexShaderSource,
		PixelTrangleShader.fragmentShaderSource
	)!

	let posArr = new Float32Array([
		10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30,
	])

	let u_resolution = gl.value!.getUniformLocation(program, 'u_resolution')
	gl.value!.uniform2f(
		u_resolution,
		(gl.value!.canvas as HTMLCanvasElement).clientWidth,
		(gl.value!.canvas as HTMLCanvasElement).clientHeight
	)

	let a_Position = gl.value!.getAttribLocation(program, 'a_Position')
	let posBuffer = gl.value!.createBuffer()
	gl.value!.bindBuffer(gl.value!.ARRAY_BUFFER, posBuffer)
	gl.value!.bufferData(gl.value!.ARRAY_BUFFER, posArr, gl.value!.STATIC_DRAW)
	gl.value!.vertexAttribPointer(a_Position, 2, gl.value!.FLOAT, false, 0, 0)
	gl.value!.enableVertexAttribArray(a_Position)

	gl.value!.clearColor(0, 0, 0, 0)
	gl.value!.clear(gl.value!.COLOR_BUFFER_BIT)
	gl.value!.drawArrays(gl.value!.TRIANGLES, 0, 6)
}

// 材质
const drawTexCoord = () => {
	let program = initShaders(
		gl.value!,
		TexCoordShader.vertexShaderSource,
		TexCoordShader.fragmentShaderSource
	)!

	let a_Position = gl.value!.getAttribLocation(program, 'a_Position')
	let verticesSizes = new Float32Array([
		//四个顶点的位置和纹理数据
		// -0.5, 0.5, -0.3, 1.7, -0.5, -0.5, -0.3, -0.2, 0.5, 0.5, 1.7, 1.7, 0.5, -0.5,
		// 1.7, -0.2,
		-0.5, 0.5, 0.0, 1.0, -0.5, -0.5, 0.0, 0.0, 0.5, 0.5, 1.0, 1.0, 0.5, -0.5,
		1.0, 0.0,
	])

	let vertexSizeBuffer = gl.value!.createBuffer()
	gl.value!.bindBuffer(gl.value!.ARRAY_BUFFER, vertexSizeBuffer)
	gl.value!.bufferData(
		gl.value!.ARRAY_BUFFER,
		verticesSizes,
		gl.value!.STATIC_DRAW
	)
	let FSIZE = verticesSizes.BYTES_PER_ELEMENT
	gl.value!.vertexAttribPointer(
		a_Position,
		2,
		gl.value!.FLOAT,
		false,
		FSIZE * 4,
		0
	)
	gl.value!.enableVertexAttribArray(a_Position)

	// 纹理
	let a_TexCoord = gl.value!.getAttribLocation(program, 'a_TexCoord')
	gl.value!.vertexAttribPointer(
		a_TexCoord,
		2,
		gl.value!.FLOAT,
		false,
		FSIZE * 4,
		FSIZE * 2
	)
	gl.value!.enableVertexAttribArray(a_TexCoord)

	initTexture(gl.value!, program)
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
</script>

<style lang="scss" scoped>
.gl_content {
	// width: 100%;
	// height: 100%;
	// position: fixed;
	// top: 50%;
	// left: 50%;
	// transform: translate(-50%, -50%);
	flex: 1;
	border: 1px solid;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 10px;

	.left_btn {
		width: 100px;
		height: 100%;
		// border: 1px solid;
		margin-right: 15px;

		display: flex;
		flex-flow: column nowrap;
		justify-content: flex-start;
		align-items: center;

		.btn {
			padding: 5px 8px;
			border: 1px solid #666;
			border-radius: 10px;
			margin: 10px 0;

			&:hover {
				cursor: pointer;
			}
		}

		.btn_active {
			color: #fff;
			background: #981a00;
		}
	}

	.right_content {
		flex: 1;
		// height: 100%;
		border: 1px solid;
	}
}
</style>
