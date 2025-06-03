<template>
	<div class="w-full h-full" id="gridLayer"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import dat from 'dat.gui'
import ZMapbox, { GridLayer } from '@z/mapbox-z'
import type { ILegend } from '@z/mapbox-z/dist/mapbox/layers/grid/config'
import testImg from '@/assets/no3_2019/no3-1-0.png'
import testImg1 from '@/assets/no3_2019/no3-1-1.png'
import testImg2 from '@/assets/no3_2019/no3-1-2.png'
import testImg3 from '@/assets/no3_2019/no3-1-3.png'
import testImg4 from '@/assets/no3_2019/no3-1-4.png'
import testImg5 from '@/assets/test.png'

const ymap = shallowRef<ZMapbox>()
const initMap = () => {
	ymap.value = new ZMapbox({
		container: 'gridLayer',
		mapType: [
			// 'http://10.1.108.214:8888/gis/tiles/GeoQ_purplishBlue/{z}/{y}/{x}.png',
			'TianDiTu.Normal.Map',
			'TianDiTu.Normal.Annotion',
		],
		center: [122, 30],
		showLatlon: (e) => {
			console.log(e)
		},
		load: (e) => {
			console.log(e)
			initGui()
			initCustomLayer()
		},
	})
}
let gui: any
const initGui = () => {
	if (gui) return
	gui = new dat.GUI()
	let guiControls = {
		高度系数: 20,
		显示标注: true,
		剖面: '关闭',
		多高度层: false,
		渲染方式: 'bitmap',
		切换图层: 0,
		最小值: 0,
		最大值: 3,
	}
	let layerHeight = gui.add(guiControls, '高度系数', 0, 100, 5)
	let minValue = gui.add(guiControls, '最小值', 0, 3, 0.1)
	let maxValue = gui.add(guiControls, '最大值', 0, 3, 0.1)
	let isMarker = gui.add(guiControls, '显示标注', false)
	let sectionType = gui.add(guiControls, '剖面', [
		'cross',
		'morePoint',
		'rotate',
		'关闭',
	])
	let crossControl = {
		经度: 124,
		纬度: 32.5,
	}
	const crossFolder = gui.addFolder('剖面范围调整')
	let currentX = 124
	let currentY = 32.5
	let crossX = crossFolder.add(crossControl, '经度', 120.6, 124, 0.1)
	crossX.onChange((val: any) => {
		// gridLayer.raise()
		currentX = val
		gridLayer.updateCrossLatlon(val, currentY)
	})
	let crossY = crossFolder.add(crossControl, '纬度', 27, 32.5, 0.1)
	crossY.onChange((val: any) => {
		// gridLayer.lower()
		currentY = val
		gridLayer.updateCrossLatlon(currentX, val)
	})

	let isMultipleHeight = gui.add(guiControls, '多高度层', true)
	let renderType = gui.add(guiControls, '渲染方式', [
		'bitmap',
		'pixel',
		'contour',
	])
	let gridIndex = gui.add(guiControls, '切换图层').min(0).max(4).step(1)

	// 层级调整
	const layerLevel = {
		value: 0,
		raise: function () {
			this.value += 1
		},
		lower: function () {
			this.value -= 1
		},
	}
	const levelFolder = gui.addFolder('层级调整')
	levelFolder.open()
	let raiseLevel = levelFolder.add(layerLevel, 'raise')
	let lowerLevel = levelFolder.add(layerLevel, 'lower')
	raiseLevel.onChange((val: any) => {
		gridLayer.raise()
	})
	lowerLevel.onChange((val: any) => {
		gridLayer.lower()
	})

	layerHeight.onChange((val: number) => {
		gridLayer.updateAltScale(val)
	})

	let min = 0
	let max = 100
	minValue.onChange((val: number) => {
		console.log(val)
		min = val
		gridLayer.updateRange([val, max])
	})
	maxValue.onChange((val: number) => {
		console.log(val)
		max = val
		gridLayer.updateRange([min, val])
	})

	isMarker.onChange((val: any) => {
		if (val) {
			gridLayer.addLayerText()
		} else {
			gridLayer.removeLayerText(true)
		}
	})

	sectionType.onChange((val: string) => {
		console.log(val)
		if (val === 'cross') {
			crossFolder.open()
		}
		if (val !== '关闭') {
			gridLayer.addSection(val, false)
		} else {
			gridLayer.addSection(null)
		}
	})

	isMultipleHeight.onChange((val: boolean) => {
		if (val) {
			gridLayer.addMultipleHeight()
		} else {
			gridLayer.removeMultipleHeight()
		}
	})

	renderType.onChange((val: string) => {
		gridLayer.updateRenderType(val)
	})

	gridIndex.onChange((val: number) => {
		gridLayer.gridIndex = val
	})
}

let gridLayer: GridLayer | null = null
let gridLayer1: GridLayer | null = null
const initCustomLayer = async () => {
	const imageArr = await ymap.value.loadImageArr([
		testImg,
		testImg1,
		testImg2,
		testImg3,
		testImg4,
	])
	const imageArrData = await ymap.value.grayImage2DataRgb([
		testImg,
		testImg1,
		testImg2,
		testImg3,
		testImg4,
	])
	const legend: ILegend[] = [
		{
			value: 0,
			color: [75, 14, 181, 1],
		},
		{
			value: 0.4,
			color: [88, 90, 248, 1],
		},
		{
			value: 0.8,
			color: [58, 162, 224, 1],
		},
		{
			value: 1.2,
			color: [41, 186, 183, 1],
		},
		{
			value: 1.6,
			color: [255, 217, 26, 1],
		},
		{
			value: 2.0,
			color: [246, 89, 4, 1],
		},
	]
	console.log(imageArrData)
	gridLayer = new GridLayer(imageArr, {
		renderType: 'bitmap',
		gridOptions: {
			startLon: 120.6,
			endLon: 124.0,
			lonStep: 0.006666,
			lonCount: 511,
			startLat: 27.0,
			endLat: 32.5,
			latStep: 0.006668,
			latCount: 826,
		},
		levelOptions: {
			// 高度层
			levels: [1, 5000, 10000, 15000, 20000],
			// 高度显示文字
			levelsLabel: ['10m', '100m', '500m', '1000m', '1500m'],
			// 离地高度
			altitude: 1,
			// 高度放大倍数
			altScale: 20,
		},
		// 文字配置
		textStyle: {
			fontColor: '#3CFFE5',
			fontSize: '14px',
		},
		range: [0, 2.0],
		legend,
	})
	gridLayer1 = new GridLayer(imageArr, {
		gridOptions: {
			startLon: 118.6,
			endLon: 122.0,
			lonStep: 0.006666,
			lonCount: 511,
			startLat: 27.0,
			endLat: 32.5,
			latStep: 0.006668,
			latCount: 826,
		},
		levelOptions: {
			// 高度层
			levels: [1, 5000, 10000, 15000],
			// 离地高度
			altitude: 1,
			// 高度放大倍数
			altScale: 20,
		},
		// range: [0, 2.0],
		legend,
	})

	// ymap.value?.addLayer(gridLayer)
	// ymap.value?.addLayer(gridLayer1)
	gridLayer.addTo(ymap.value)

	// let index = 0
	// setInterval(() => {
	// 	gridLayer.gridIndex = index
	// 	index = (index % 4) + 1
	// }, 500)
	// setTimeout(() => {
	// 	gridLayer.addMultipleHeight()
	// }, 5000)
	console.log(gridLayer)
	console.log(ymap.value.map)
}

onMounted(() => {
	initMap()
})
onBeforeUnmount(() => {
	gui && gui.destroy()
})
</script>

<style lang="scss" scoped></style>
