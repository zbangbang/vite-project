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
			v-if="activeBtnType === BtnType.Three"
			class="absolute right-6 top-16 w-100"
			v-model:x="threeHookParams.xValue"
			:x-range="threeHookParams.xRange"
			v-model:y="threeHookParams.yValue"
			:y-range="threeHookParams.yRange"
			v-model:z="threeHookParams.zValue"
			:z-range="threeHookParams.zRange"
			v-model:rx="threeHookParams.xRotate"
			v-model:ry="threeHookParams.yRotate"
			v-model:rz="threeHookParams.zRotate"
			v-model:sx="threeHookParams.xScale"
			:sx-range="threeHookParams.sxRange"
			v-model:sy="threeHookParams.yScale"
			:sy-range="threeHookParams.syRange"
		></SliderVue>
		<div
			v-if="activeBtnType === BtnType.Camera"
			class="absolute right-6 top-16 w-100 flex items-center"
		>
			<span class="inline-block w-24">相机角度</span>
			<el-slider
				v-model="cameraAngle"
				:min="-360"
				:max="360"
				show-input
				size="small"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { TrangleShader, PixelTrangleShader } from '@/shader/glNew'
import { ThreeShader } from '@/shader/lesson2/three'
import { TexCoordShader } from '@/shader/glTex'
import useWebGL from '@/hooks/useWebGL/index'
import useTexCoord from '@/hooks/webgl/lesson1/useTexCoord'
import useThreeHook from '@/hooks/webgl/lesson2/useThree'
import texImg from '@/assets/images/tex.png'
import SliderVue from '@/components/slider/sliderOne.vue'
import { onMounted } from 'vue'
import { BtnType } from './config'
import { IThreeParam } from '@/hooks/webgl/lesson2/types'
import { toRefs } from 'vue'
import useCamera from '@/hooks/webgl/lesson2/useCamera'

const { initShaders, gl } = useWebGL('webgl-canvas')

const glBtnList = ref([
	{
		label: '3D',
		value: BtnType.Three,
		active: false,
	},
	{
		label: '相机',
		value: BtnType.Camera,
		active: false,
	},
])

const activeBtnType = ref<BtnType>()
// 选择按钮
const chooseDrawItem = (item: any, index: number) => {
	clearAll()
	if (item.active) {
		item.active = false
		return
	} else {
		glBtnList.value.forEach((btn) => (btn.active = false))
		item.active = true
		activeBtnType.value = item.value
	}

	switch (item.value) {
		case BtnType.Three:
			program = initShaders(
				gl.value!,
				ThreeShader.vertexShaderSource,
				ThreeShader.fragmentShaderSource
			)!
			threeHookParams.value.xRange = [
				-(gl.value!.canvas as HTMLCanvasElement).clientWidth,
				(gl.value!.canvas as HTMLCanvasElement).clientWidth,
			]
			threeHookParams.value.yRange = [
				-(gl.value!.canvas as HTMLCanvasElement).clientHeight,
				(gl.value!.canvas as HTMLCanvasElement).clientHeight,
			]

			threeHook = useThreeHook(gl.value!, program)
			threeHook.drawThree(threeHookParams.value)
			break
		case BtnType.Camera:
			program = initShaders(
				gl.value!,
				ThreeShader.vertexShaderSource,
				ThreeShader.fragmentShaderSource
			)!

			threeHook = useCamera(gl.value!, program)
			threeHook.drawThree(cameraAngle.value)

			break

		default:
			break
	}
}
const clearAll = () => {
	gl.value!.clearColor(1.0, 1.0, 1.0, 1.0)
	gl.value!.clear(gl.value!.COLOR_BUFFER_BIT)
}

// 3D
let program: WebGLProgram | null = null
let threeHook: any
const threeHookParams = ref<IThreeParam>({
	xValue: 175,
	xRange: [-1000, 1000],
	yValue: 100,
	yRange: [-1000, 1000],
	zValue: -200,
	zRange: [-1000, 1000],
	xRotate: 0,
	yRotate: 0,
	zRotate: 0,
	rRange: [0, 360],
	xScale: 1,
	sxRange: [0, 5],
	yScale: 1,
	syRange: [0, 5],
	zScale: 1,
})

watch(
	() => threeHookParams.value,
	(threeHookParams) => {
		threeHook.reDrawTrangle(threeHookParams)
	},
	{
		deep: true,
	}
)

const cameraAngle = ref(0)
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
