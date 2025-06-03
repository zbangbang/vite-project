<template>
	<div class="w-full h-full" id="container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import dat from 'dat.gui'
import ZMapbox, { WindLayer } from '@z/mapbox-z'
import windJson from '@/assets/json/wind.json'

const ymap = shallowRef<ZMapbox>()
const initMap = () => {
	ymap.value = new ZMapbox({
		container: 'container',
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
const initWindLayer = async () => {
	console.log(windJson)
	windLayer = new WindLayer('wind', windJson, {
		windOptions: {
			// 颜色配置
			colorScale: (m: any) => {
				// console.log(m);
				return '#fff'
			},
			// colorScale: [
			// 	'rgb(36,104, 180)',
			// 	'rgb(60,157, 194)',
			// 	'rgb(128,205,193 )',
			// 	'rgb(151,218,168 )',
			// 	'rgb(198,231,181)',
			// 	'rgb(238,247,217)',
			// 	'rgb(255,238,159)',
			// 	'rgb(252,217,125)',
			// 	'rgb(255,182,100)',
			// 	'rgb(252,150,75)',
			// 	'rgb(250,112,52)',
			// 	'rgb(245,64,32)',
			// 	'rgb(237,45,28)',
			// 	'rgb(220,24,32)',
			// 	'rgb(180,0,35)',
			// ],
			frameRate: 12,
			maxAge: 60,
			globalAlpha: 0.98,
			velocityScale: 0.01,
			// velocityScale: () => {
			// 	const zoom = map.getZoom();
			// 	return velocityScales[zoom] || 0.01
			// },
			// paths: 10000,
			paths: 3782,
		},
		fieldOptions: {
			wrapX: true,
		},
	})
	windLayer.addTo(ymap.value)
}

onMounted(() => {
	initMap()
})
</script>

<style lang="scss" scoped></style>
