<template>
	<div class="w-full h-full" id="wind"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import dat from 'dat.gui'
import ZMapbox, { WindLayer, WindLayerGL } from '@z/mapbox-z'
import windImg2 from '@/assets/images/wind/wind-surface.png'
import windImg1 from '@/assets/images/wind/uv-mc.png'
import windImg from '@/assets/images/wind/wind-mc.png'

const ymap = shallowRef<ZMapbox>()
const initMap = () => {
	ymap.value = new ZMapbox({
		container: 'wind',
		mapType: [
			// 'http://10.1.108.214:8888/gis/tiles/GeoQ_purplishBlue/{z}/{y}/{x}.png',
			'TianDiTu.Normal.Map',
			'TianDiTu.Normal.Annotion',
		],
		center: [122, 30],
		showLatlon: (e: any) => {
			console.log(e)
		},
		load: (e: any) => {
			initGui()
			initWindLayerGL()
		},
	})
}
let gui: any
const initGui = () => {
	if (gui) return
	gui = new dat.GUI()
	let guiControls = {
		speedFactor: [
			'interpolate',
			['exponential', 0.5],
			['zoom'],
			0,
			1,
			15,
			0.01,
		],
		fadeOpacity: 0.93,
		dropRate: 0.003,
		dropRateBump: 0.002,
	}
	gui.add(guiControls, 'fadeOpacity', 0, 1).onChange(function () {
		windLayer.updateOptions({
			styleSpec: guiControls,
		})
	})

	gui.add(guiControls, 'dropRate', 0, 0.1).onChange(function () {
		windLayer.updateOptions({
			styleSpec: guiControls,
		})
	})

	gui.add(guiControls, 'dropRateBump', 0, 0.1).onChange(function () {
		windLayer.updateOptions({
			styleSpec: guiControls,
		})
	})
}

let windLayer: WindLayer | null = null
const initWindLayerGL = async () => {
	// 例子相关配置
	const particlesConfig = {
		// 例子速度
		speedFactor: [
			'interpolate',
			['exponential', 0.5],
			['zoom'],
			0,
			1,
			15,
			0.0005,
		],
		fadeOpacity: 0.93,
		dropRate: 0.003,
		dropRateBump: 0.002,
	}

	windLayer = new WindLayerGL('wind', {
		wrapX: true,
		// 数据经纬度范围，纬度最大支持范围
		range: [
			[-180, -85.051129],
			[180, 85.051129],
		],
		// uv分量的数据大小范围
		uvRange: [
			[-21.381948471069336, 23.992563247680664],
			[-20.644954681396484, 21.251964569091797],
		],
		// uv图
		url: windImg,
		// 颜色、透明度和粒子数量配置
		styleSpec: {
			'fill-color': [
				'interpolate',
				['step', 1],
				['get', 'value'],
				0,
				'#fff',
				104,
				'#f00',
			],
			opacity: ['interpolate', ['exponential', 0.5], ['zoom'], 1, 1, 2, 1],
			numParticles: [
				'interpolate',
				['exponential', 0.5],
				['zoom'],
				0, // zoom
				65535 / 8, // numParticles
				8, // zoom
				65535 / 16, // numParticles
			],
			...particlesConfig,
		},
		// 风大小范围
		displayRange: [0, 104],
	})
	windLayer.addTo(ymap.value)

	setTimeout(() => {
		windLayer.updateSource({
			url: windImg2,
		})
	}, 5000)
}

onMounted(() => {
	initMap()
})
onBeforeUnmount(() => {
	gui && gui.destroy()
})
</script>

<style lang="scss" scoped></style>
