<template>
	<div class="cesiumBox" id="cesium-s"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import dat from 'dat.gui'
import SCesium, { GridDataLayer, MeasureLayer } from '@s/cesium-s'
import img1 from '@/assets/radar/1000.png'
import img2 from '@/assets/radar/2000.png'
import img3 from '@/assets/radar/3000.png'
import img4 from '@/assets/radar/4000.png'
import img5 from '@/assets/radar/5000.png'
const urls = [img1, img2, img3, img4, img5]

let gui: any
const initGui = () => {
	if (gui) return
	gui = new dat.GUI()
	let guiControls = {
		高度系数: 20,
		剖面: '关闭',
		多高度层: false,
		渲染方式: 'bitmap',
		测距: false,
		测面积: false,
		测角度: false,
		测坡度: false,
	}

	let sectionType = gui.add(guiControls, '剖面', [
		'cross',
		'morePoint',
		'rotate',
		'关闭',
	])

	let isMultipleHeight = gui.add(guiControls, '多高度层', true)

	// let minValue = gui.add(guiControls, '最小值', 0, 3, 0.1)
	// let maxValue = gui.add(guiControls, '最大值', 0, 3, 0.1)
	// let min = 0
	// let max = 100
	// minValue.onChange((val: number) => {
	// 	console.log(val)
	// 	min = val
	// 	gridLayer.updateRange([val, max])
	// })
	// maxValue.onChange((val: number) => {
	// 	console.log(val)
	// 	max = val
	// 	gridLayer.updateRange([min, val])
	// })

	sectionType.onChange((val: string) => {
		console.log(val)
		if (val !== '关闭') {
			gridLayer.addSection(val)
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

	let measureLine = gui.add(guiControls, '测距', false)
	measureLine.onChange((val) => {
		if (val) {
			changeMeasure('line')
		} else {
			changeMeasure()
		}
	})
	let measureArea = gui.add(guiControls, '测面积', false)
	measureArea.onChange((val) => {
		if (val) {
			changeMeasure('polygon')
		} else {
			changeMeasure()
		}
	})
	let measureAngle = gui.add(guiControls, '测角度', false)
	measureAngle.onChange((val) => {
		if (val) {
			changeMeasure('angle')
		} else {
			changeMeasure()
		}
	})
	let measureSlope = gui.add(guiControls, '测坡度', false)
	measureSlope.onChange((val) => {
		if (val) {
			changeMeasure('slopeAnalysis')
		} else {
			changeMeasure()
		}
	})
}

const radarLegend = [
	// { value: 0, color: [255, 255, 255, 1], label: '我是零' },
	{ value: 10, color: [255, 255, 0, 0], label: '我是零' },
	{ value: 15, color: [0, 160, 246, 1] },
	{ value: 20, color: [0, 236, 236, 1] },
	{ value: 25, color: [0, 216, 0, 1] },
	{ value: 30, color: [0, 144, 0, 1] },
	{ value: 35, color: [255, 255, 0, 1] },
	{ value: 40, color: [231, 192, 0, 1] },
	{ value: 45, color: [255, 144, 0, 1] },
	{ value: 50, color: [255, 0, 0, 1] },
	{ value: 55, color: [214, 0, 0, 1] },
	{ value: 60, color: [192, 0, 0, 1] },
	{ value: 65, color: [255, 0, 240, 1] },
	{ value: 70, color: [150, 0, 180, 1] },
	// { value: 200, color: [150, 0, 180, 1] },
]

let gridLayer: any
const init = async () => {
	let sCesium = new SCesium({
		containerId: 'cesium-s',
		mapType: ['TianDiTu.Satellite.Map'],
		token:
			'pk.eyJ1IjoibDA0MDYwMyIsImEiOiJja3pkeHFuZGcwYnVhMnFucjBieDU0d282In0.pxXFUyyALaSiPNzm3QjEgw',
	})
	// sCesium.addTerrain()

	const imageData = await sCesium.getDataByImages(urls)
	const gridData = imageData.data

	gridLayer = new GridDataLayer(gridData, {
		renderType: ['bitmap'],
		gridOptions: {
			startLon: 114.4,
			endLon: 117.4,
			startLat: 27.2,
			endLat: 30.2,
			lonCount: 301,
			latCount: 301,
			lonStep: 0.01,
			latStep: 0.01,
			altitude: 0,
			levels: [1000, 2000, 3000, 4000, 5000],
			altScale: 10,
		},
		legend: radarLegend,
		range: [radarLegend[0].value, radarLegend[radarLegend.length - 1].value],
	})

	gridLayer.addTo()
}

let measure: MeasureLayer
const initMeasure = () => {
	measure = new MeasureLayer()
	measure.addTo()
}
const changeMeasure = (val?: string) => {
	if (!val) {
		measure.clear()
		return
	}
	measure.draw(val)
}

onMounted(() => {
	initGui()
	init()
	initMeasure()
})
</script>

<style lang="scss" scoped>
.cesiumBox {
	width: 100%;
	height: 700px;
	border: 1px solid #ccc;
}
</style>
