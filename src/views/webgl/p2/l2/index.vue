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
		<div ref="boxRef" class="w-full h-full relative">
			<canvas
				class="absolute top-0 left-0"
				ref="canvasRef"
				id="webgl-canvas"
			></canvas>
			<canvas
				class="absolute top-0 left-0"
				ref="textRef"
				id="text-canvas"
			></canvas>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { BtnType } from './config'
import * as twgl from 'twgl.js'
import { clearMartix2FrameBuffer, initMartix2FrameBuffer } from './matrix2'
import { clearCameraFrameBuffer, initCameraFrameBuffer } from './camera'
import { clearTextureFrameBuffer, initTextureFrameBuffer } from './texture'
import {
	clearTextureCubeFrameBuffer,
	initTextureCubeFrameBuffer,
} from './textureCube'
import {
	clearMultiObjectFrameBuffer,
	initMultiObjectFrameBuffer,
} from './multiObject'
import {
	clearDrawTextCanvasFrameBuffer,
	initDrawTextCanvasFrameBuffer,
} from './drawTextCanvas'
import { clearDrawTextFrameBuffer, initDrawTextFrameBuffer } from './drawText'
twgl.setDefaults({ attribPrefix: 'a_' })

const boxRef = ref()
const canvasRef = ref()
const textRef = ref()
let gl: WebGL2RenderingContext
onMounted(() => {
	canvasRef.value.width = boxRef.value.clientWidth
	canvasRef.value.height = boxRef.value.clientHeight
	textRef.value.width = boxRef.value.clientWidth
	textRef.value.height = boxRef.value.clientHeight

	gl = canvasRef.value!.getContext('webgl2', {
		// alpha: false, // 禁用 alpha
		// premultipliedAlpha: false,
		// preserveDrawingBuffer: true, // 保证 readPixels 可读
		stencil: true, // 开启模板测试
	})

	chooseDrawItem(glBtnList.value[glBtnList.value.length - 1])
})

const glBtnList = ref([
	{
		label: '二三维矩阵',
		value: BtnType.Matrix2,
		active: false,
	},
	{
		label: '相机',
		value: BtnType.Camera,
		active: false,
	},
	{
		label: '纹理',
		value: BtnType.Texture,
		active: false,
	},
	{
		label: '立方体',
		value: BtnType.TextureCube,
		active: false,
	},
	{
		label: '多物体',
		value: BtnType.MultiObject,
		active: false,
	},
	{
		label: '文字Canvas',
		value: BtnType.TextCanvas,
		active: false,
	},
	{
		label: '文字纹理',
		value: BtnType.Text,
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
		// 三维矩阵
		case BtnType.Matrix2:
			initMartix2FrameBuffer(gl)
			break
		// 相机
		case BtnType.Camera:
			initCameraFrameBuffer(gl)
			break
		// 纹理
		case BtnType.Texture:
			initTextureFrameBuffer(gl)
			break
		// 纹理-立方体
		case BtnType.TextureCube:
			initTextureCubeFrameBuffer(gl)
			break
		// 多物体
		case BtnType.MultiObject:
			initMultiObjectFrameBuffer(gl)
			break
		// 文字
		case BtnType.TextCanvas:
			initDrawTextCanvasFrameBuffer(gl)
			break
		// 文字纹理
		case BtnType.Text:
			initDrawTextFrameBuffer(gl)
			break

		default:
			break
	}
}
const clearAll = () => {
	clearMartix2FrameBuffer()
	clearCameraFrameBuffer()
	clearTextureFrameBuffer()
	clearTextureCubeFrameBuffer()
	clearMultiObjectFrameBuffer()
	clearDrawTextCanvasFrameBuffer()
	clearDrawTextFrameBuffer()
	gl.clearColor(1.0, 1.0, 1.0, 1.0)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
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
}
</style>
