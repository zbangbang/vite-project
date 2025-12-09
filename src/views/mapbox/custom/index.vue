<template>
	<div class="w-full h-full border">
		<div class="w-full h-full" id="mapbox-container"></div>
		<div class="fixed bottom-10 right-16 w-16 h-52">
			<YLegend
				:legend-list="legendList"
				:draggable="false"
				title="温度"
				:unit="unit"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import mapboxgl from 'mapbox-gl'
import GridLayer from './GridLayer'
import testImg1 from '@/assets/no3_2019/no3-1-1.png'
import testImg2 from '@/assets/no3_2019/no3-1-2.png'
import testImg3 from '@/assets/no3_2019/no3-1-3.png'
import testImg4 from '@/assets/no3_2019/no3-1-4.png'
import { YLegend, legendObj } from '@s/wtxmy-ui'

const legendList: any[] = legendObj.TEM_2M_LEGEND.legend
const unit = legendObj.TEM_2M_LEGEND.unit

const smap = shallowRef<mapboxgl.Map>()
const initMap = () => {
	mapboxgl.accessToken =
		'pk.eyJ1IjoiemJhbmdiYW5nIiwiYSI6ImNtMWhrcmk1OTAydzQya3F1MXhlYXd4OHEifQ.jYNP6TDEs-ZGNhW2GpmyTQ'

	smap.value = new mapboxgl.Map({
		container: 'mapbox-container',
		style: 'mapbox://styles/mapbox/streets-v9',
		zoom: 1,
		center: [30, 15],
	})

	smap.value.on('load', (ev) => {
		initCustomLayer()
	})
}
/**
 * @Date: 2023-08-02 19:47:21
 * @Description: 加载图片
 * @param {string} url
 * @return {*}
 */
const loadImage = async (url: string, type: 'image' | 'svg' = 'image') => {
	return new Promise(
		(resolve: (img: ImageBitmap | HTMLElement | null) => void) => {
			fetch(url).then((res) => {
				res.blob().then((blob) => {
					createImageBitmap(blob).then((imgBitmap) => {
						resolve(imgBitmap)
					})
				})
			})
		}
	)
}

/**
 * @Date: 2023-08-02 19:46:36
 * @Description: 加载图片，得到 imageData
 * @param {string} urlArr
 * @return {*}
 */
const loadImageArr = async (
	urlArr: string[],
	type: 'image' | 'svg' = 'image'
) => {
	let imageArr: ImageBitmap[] = []

	for (let i = 0, len = urlArr.length; i < len; i++) {
		await loadImage(urlArr[i], type)
			.then((imgBitmap) => {
				imageArr.push(imgBitmap as ImageBitmap)
			})
			.catch((url) => {
				console.warn(url + ' 图片加载失败!')
			})
	}
	return imageArr
}
const initCustomLayer = async () => {
	const imageArr = await loadImageArr([testImg1, testImg2, testImg3, testImg4])
	smap.value?.addLayer(
		new GridLayer(imageArr, {
			readBack: (pix: any) => {
				console.log(pix)
			},
		})
	)
}
onMounted(() => {
	initMap()
})
</script>

<style lang="scss" scoped></style>
