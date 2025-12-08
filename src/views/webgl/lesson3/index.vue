<template>
	<div class="gl_content">
		<div class="left_btn">
			<div
				v-for="(item, index) in glBtnList"
				:key="index"
				:class="{ btn: true, btn_active: item.active }"
				@click.stop="chooseDrawItem(item)"
			>
				{{ item.label }}
			</div>
		</div>
		<div ref="boxRef" class="w-96 h-96">
			<canvas class="right_content" ref="canvasRef" id="webgl-canvas"></canvas>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { BtnType } from './config'
import * as twgl from 'twgl.js'
import { clearTexture, initTexture } from './texture'
import { clearViewMatrix, initViewMatrix } from './viewMatrix'
import { clearCube, initCube } from './cube'
import { clearLight, initLight, initPointLight } from './light'
import { clearModel, initModel } from './model'
import { clearMouse, initMouse } from './mouse'
import { clearFog, initFog } from './fog'
import { clearFrameBuffer, initFrameBuffer } from './frameBuffer'
import { initStencilTest } from './stencil'
twgl.setDefaults({ attribPrefix: 'a_' })

const boxRef = ref()
const canvasRef = ref()
let gl: WebGLRenderingContext
onMounted(() => {
	canvasRef.value.width = boxRef.value.clientWidth
	canvasRef.value.height = boxRef.value.clientHeight

	gl = canvasRef.value!.getContext('webgl', {
		// alpha: false, // 禁用 alpha
		// premultipliedAlpha: false,
		// preserveDrawingBuffer: true, // 保证 readPixels 可读
		stencil: true, // 开启模板测试
	})

	chooseDrawItem(glBtnList.value[glBtnList.value.length - 1])
})

const glBtnList = ref([
	{
		label: '纹理',
		value: BtnType.texture,
		active: false,
	},
	{
		label: '视图矩阵',
		value: BtnType.viewMatrix,
		active: false,
	},
	{
		label: '立方体',
		value: BtnType.cube,
		active: false,
	},
	{
		label: '平行光',
		value: BtnType.light,
		active: false,
	},
	{
		label: '点光源',
		value: BtnType.pointLight,
		active: false,
	},
	{
		label: '层次模型',
		value: BtnType.model,
		active: false,
	},
	{
		label: '鼠标操作',
		value: BtnType.mouse,
		active: false,
	},
	{
		label: '雾',
		value: BtnType.fog,
		active: false,
	},
	{
		label: '渲染到纹理',
		value: BtnType.frameBuffer,
		active: false,
	},
	{
		label: '模板测试',
		value: BtnType.stencil,
		active: false,
	},
])

const activeBtnType = ref<BtnType>()
// 选择按钮
const chooseDrawItem = (item: any) => {
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
		// 纹理
		case BtnType.texture:
			initTexture(gl)
			break
		// 视图
		case BtnType.viewMatrix:
			initViewMatrix(gl)
			break
		// 立方体
		case BtnType.cube:
			initCube(gl)
			break
		// 平行光+环境光
		case BtnType.light:
			initLight(gl)
			break
		// 点光源+环境光
		case BtnType.pointLight:
			initPointLight(gl)
			break
		// 层次模型
		case BtnType.model:
			initModel(gl)
			break
		// 鼠标操作
		case BtnType.mouse:
			initMouse(gl, canvasRef.value)
			break
		// 雾
		case BtnType.fog:
			initFog(gl)
			break
		// 渲染到纹理
		case BtnType.frameBuffer:
			initFrameBuffer(gl)
			break
		// 模板测试
		case BtnType.stencil:
			initStencilTest(gl)
			break

		default:
			break
	}
}
const clearAll = () => {
	clearTexture()
	clearViewMatrix()
	clearCube()
	clearLight()
	clearModel()
	clearMouse()
	clearFog()
	clearFrameBuffer()
	gl.clearColor(1.0, 1.0, 1.0, 1.0)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
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
		border: 1px solid #f00;
	}
}
</style>
