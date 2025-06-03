<template>
	<div class="w-full h-full" id="typhoon"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import ZMapbox, { TyphoonRoute } from '@z/mapbox-z'
import { typhoonData } from './config'
import typhoonImg from '@/assets/images/typhoon/typhoon.png'

const ymap = shallowRef<ZMapbox>()
const initMap = () => {
	ymap.value = new ZMapbox({
		container: 'typhoon',
		center: [120, 10],
		zoom: 3,
		mapType: [
			'http://10.1.108.214:8888/gis/tiles/GeoQ_purplishBlue/{z}/{y}/{x}.png',
		],
		showLatlon: (e) => {
			console.log(e)
		},
		load: (e) => {
			console.log(e)

			initTyphoon()
		},
	})
}

let typhoon: TyphoonRoute
const initTyphoon = () => {
	typhoon = new TyphoonRoute(typhoonData, {
		// 线配置，支持线的所有paint属性
		linePaint: {
			'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1, 10, 3],
			'line-color': '#fb5614',
		},
		// 点配置，支持线的所有paint属性
		pointPaint: {
			// 'circle-radius': [
			// 	'interpolate',
			// 	['cubic-bezier', 0.85, 0.45, 0, 0.65],
			// 	['zoom'],
			// 	5,
			// 	['*', 20, 0.4],
			// 	10,
			// 	['*', 20, 1],
			// ],
			'circle-color': [
				'match',
				['get', 'strong'],
				'热带低压',
				'#00FEDF',
				'热带风暴',
				'#FEF300',
				'强热带风暴',
				'#FE902C',
				'台风',
				'#FE0404',
				'强台风',
				'#FE3AA3',
				'超强台风',
				'#AE00D9',
				'#ff0000',
			],
			'circle-opacity': 0.8,
			'circle-stroke-width': 3,
			'circle-stroke-color': 'rgba(110, 110, 110, .3)',
		},
		// 风圈颜色配置，支持线的所有paint属性
		circlePaint: {
			'fill-color': 'rgba(130,90,25, 0.4)',
			'fill-outline-color': 'rgba(130,90,25, 1)',
		},
		// 默认显示在第几个点
		currentIndex: 0,
		// 台风图片
		img: typhoonImg,
		// 台风图片是否开启旋转动画
		rotate: true,
		// 台风点的点击事件，可用于popup展示等
		clickEv: clickTyphoon,
	})
	typhoon.addTo(ymap.value)

	// 开启动画
	// typhoon.start(500)
}

const clickTyphoon = (e) => {
	console.log(e)
	console.log(e.features)
}

onMounted(() => {
	initMap()
})
</script>

<style lang="scss" scoped></style>
