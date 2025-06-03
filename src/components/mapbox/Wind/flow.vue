<template>
	<div class="w-full h-full" id="flow"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import dat from 'dat.gui'
import ZMapbox, { WindFlowLayer } from '@z/mapbox-z'
import windJson from '@/assets/json/windPlume.json'

const ymap = shallowRef<ZMapbox>()
const initMap = () => {
	ymap.value = new ZMapbox({
		container: 'flow',
		mapType: [
			// 'http://10.1.108.214:8888/gis/tiles/GeoQ_purplishBlue/{z}/{y}/{x}.png',
			'TianDiTu.Normal.Map',
			'TianDiTu.Normal.Annotion',
		],
		center: [122, 30],
		customStyle: {
			glyphs: '/assets/fonts/mapbox/{fontstack}/{range}.pbf',
		},
		showLatlon: (e: any) => {
			console.log(e)
		},
		load: (e: any) => {
			// initGui()
			initWindLayer()
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
		flowLayer.updateOptions({
			styleSpec: guiControls,
		})
	})

	gui.add(guiControls, 'dropRate', 0, 0.1).onChange(function () {
		flowLayer.updateOptions({
			styleSpec: guiControls,
		})
	})

	gui.add(guiControls, 'dropRateBump', 0, 0.1).onChange(function () {
		flowLayer.updateOptions({
			styleSpec: guiControls,
		})
	})
}

let flowLayer: WindFlowLayer | null = null
const initWindLayer = async () => {
	flowLayer = new WindFlowLayer('flow', windJson, {
		lat: '0',
		lng: '1',
		value: '2',
		dir: '3',
		isBounds: true, // 是否开启视野裁剪优化
		color: '#1494B7', // 颜色
		// longLen: 24, // 箭头杆长
		// shortLen: 10, // 箭头长
		// lineWidth: 3, // 箭头线宽
	})
	flowLayer.addTo(ymap.value)

	// setTimeout(() => {
	// 	windPlume.removeLayer()
	// 	console.log(ymap.value)
	// }, 2000)
}

onMounted(() => {
	initMap()
})
</script>

<style lang="scss" scoped></style>
