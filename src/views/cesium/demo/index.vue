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
import { UrlTemplateImageryProvider, Viewer } from 'cesium'
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
}

onMounted(() => {
	initMap()
})
</script>

<style lang="scss" scoped></style>
