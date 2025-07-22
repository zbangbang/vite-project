<template>
	<div class="w-full h-full" id="shpContainer"></div>
	<div class="fixed right-24 top-40 bg-[#fff] p-2 rounded" @click="previewShp">
		shp预览
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import ZMapbox from '@z/mapbox-z'
import * as shapefile from 'shapefile'

const ymap = shallowRef<ZMapbox>()
const initMap = () => {
	ymap.value = new ZMapbox({
		container: 'shpContainer',
		mapType: [
			'http://10.1.108.214:8888/gis/tiles/GeoQ_purplishBlue/{z}/{y}/{x}.png',
		],
		showLatlon: (e) => {
			console.log(e)
		},
		load: (e) => {
			console.log(e)
		},
	})
}

const previewShp = () => {
	// fetch('/shp/A河道.shp')
	fetch('/shp/F蓄滞洪区.shp')
		.then((response) => response.arrayBuffer())
		.then((buffer) => shapefile.open(buffer))
		.then((source) => {
			debugger
			source.read().then((result) => {
				debugger
				if (result.done) return
				// 存储转换后的 GeoJSON 数据
				const geojson = {
					type: 'FeatureCollection',
					features: [] as any[],
				}
				geojson.features.push(result.value)
				ymap.value.map.addSource('shp-source', {
					type: 'geojson',
					data: geojson,
				})
				ymap.value.map.addLayer({
					id: 'shp-line',
					type: 'line',
					source: 'shp-source',
					layout: {
						'line-cap': 'round',
						'line-join': 'round',
					},
					paint: {
						'line-color': '#3AC7FF',
						'line-width': [
							// 'match',
							// ['get', 'width'],
							// 2, 2,
							// 10, 10,
							// 2,
							'interpolate',
							['linear'],
							['zoom'],
							10,
							['match', ['get', 'width'], 2, 2.5, 10, 10, 2.5],
							16,
							['match', ['get', 'width'], 2, 8, 10, 10, 8],
						],
					},
					filter: ['in', '$type', 'LineString'],
				})
				ymap.value.map.addLayer({
					id: 'shp-layer',
					type: 'fill',
					source: 'shp-source',
					paint: {
						'fill-color': 'blue',
						'fill-opacity': 0.5,
					},
					filter: ['in', '$type', 'Polygon'],
				})
			})
		})
		.catch((error) => {
			console.error('转换过程中出现错误:', error)
		})
}

onMounted(() => {
	initMap()
})
</script>

<style lang="scss" scoped></style>
