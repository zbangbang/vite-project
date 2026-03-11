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
		<div ref="boxRef" class="w-full h-full">
			<canvas class="right_content" ref="canvasRef" id="webgl-canvas"></canvas>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { BtnType } from './config'
import * as twgl from 'twgl.js'
import { clearFrameBuffer, initFrameBuffer } from './frameBuffer'
import { initParticle } from './particle'
twgl.setDefaults({ attribPrefix: 'a_' })

const boxRef = ref()
const canvasRef = ref()
let gl: WebGLRenderingContext
onMounted(() => {
	canvasRef.value.width = boxRef.value.clientWidth
	canvasRef.value.height = boxRef.value.clientHeight

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
		label: '渲染到纹理',
		value: BtnType.frameBuffer,
		active: false,
	},
	{
		label: '粒子',
		value: BtnType.particle,
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
		// 渲染到纹理
		case BtnType.frameBuffer:
			initFrameBuffer(gl)
			break
		// 粒子
		case BtnType.particle:
			initParticle(gl)
			break

		default:
			break
	}
}
const clearAll = () => {
	clearFrameBuffer()
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

	.right_content {
		flex: 1;
		// height: 100%;
		border: 1px solid #f00;
	}
}
</style>
