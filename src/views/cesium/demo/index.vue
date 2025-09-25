<template>
	<div class="w-full h-full relative">
		<div id="MapContainer"></div>
		<div class="absolute top-10 right-5 left-12 flex flex-wrap">
			<div
				class="bg-yellow-100 px-3 py-2 mr-1 mb-1 cursor-pointer"
				:class="[item.flag ? 'text-[#79d9ff]' : '']"
				v-for="(item, index) in btnList"
				:key="index"
				@click="changeItem(item)"
			>
				{{ item.label }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import testImg from '@/assets/tex.png'
import {
	Cartesian2,
	Cartesian3,
	ScreenSpaceEventHandler,
	ScreenSpaceEventType,
	UrlTemplateImageryProvider,
	Viewer,
} from 'cesium'
// import { UrlTemplateImageryProvider } from '@cesium/engine'
// import useCesium from '@/hooks/cesium/useCesium'
// import { BtnType, IBtn, btnTypeList, imgList } from './config'
// import * as Cesium from 'cesium'
// const { viewer } = useCesium('MapContainer')
window.CESIUM_BASE_URL = 'cesium/'

let viewer
const initMap = () => {
	viewer = new Viewer('MapContainer', {
		baseLayer: false,
		baseLayerPicker: false,
		scene3DOnly: true,
		contextOptions: {
			webgl: {
				alpha: true,
				depth: false,
				stencil: true,
				antialias: true,
				premultipliedAlpha: true,
				preserveDrawingBuffer: true,
				failIfMajorPerformanceCaveat: true,
			},
		},
	})

	setBaseLayer()
}

let startLon = 120
/**
 * @Date: 2024-11-01 11:18:53
 * @Description: 根据配置设置底图
 * @return {*}
 */
const setBaseLayer = async () => {
	viewer!.imageryLayers.addImageryProvider(
		new UrlTemplateImageryProvider({
			url: `http://10.1.108.214:8888/gis/tiles/GeoQ_colors/{z}/{y}/{x}.png`,
		}),
		0
	)
	viewer!.camera.setView({
		destination: Cartesian3.fromDegrees(startLon, 90, 10000000),
		// destination: Cesium.Cartesian3.fromDegrees(121.3, 90, 20000000),
		duration: 1,
	})

	enableWorldZAxisRotation(viewer!)
}

function enableWorldZAxisRotation(viewer: any) {
	const controller = viewer.scene.screenSpaceCameraController
	controller.enableTranslate = false // 禁用平移
	controller.enableTilt = false // 禁用倾斜
	controller.enableZoom = true // 可选：禁用缩放
	controller.enableLook = false // 禁用中键

	const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
	let isDragging = false
	let previousMousePosition: any = null

	// 鼠标按下
	handler.setInputAction(function (movement) {
		isDragging = true
		previousMousePosition = movement.position
	}, ScreenSpaceEventType.LEFT_DOWN)

	// 鼠标抬起
	handler.setInputAction(function () {
		isDragging = false
		previousMousePosition = null
	}, ScreenSpaceEventType.LEFT_UP)

	// 鼠标移动
	handler.setInputAction(function (movement) {
		if (!isDragging || !previousMousePosition) return

		let deltaX = movement.endPosition.x - movement.startPosition.x
		deltaX = Cartesian2.distance(movement.endPosition, movement.startPosition)

		deltaX = ((deltaX * 180) / Math.PI) * 0.01

		startLon += deltaX
		viewer!.camera.setView({
			destination: Cartesian3.fromDegrees(
				startLon,
				90,
				viewer!.camera.positionCartographic.height
			),
			duration: 1,
		})
	}, ScreenSpaceEventType.MOUSE_MOVE)
}

onMounted(() => {
	initMap()
})
</script>

<style lang="scss" scoped></style>
