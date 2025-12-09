<template>
	<div id="olMap" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Icon, Stroke, Style } from 'ol/style'
import Point from 'ol/geom/Point'
import Feature from 'ol/Feature'
import { LineString } from 'ol/geom'
import { fromLonLat } from 'ol/proj'

const olMap = shallowRef<Map>()
const initMap = () => {
	olMap.value = new Map({
		target: 'olMap',
		layers: [
			new TileLayer({
				source: new XYZ({
					url: 'http://tiles.geovis.cc/GeoQ_colors/{z}/{y}/{x}.png',
				}),
			}),
		],
		view: new View({
			center: [111.563372612, 22.76211895282],
			zoom: 2,
			minZoom: 1,
			maxZoom: 18,
			projection: 'EPSG:4326',
		}),
	})
}

onMounted(() => {
	initMap()
})

watch(
	() => olMap.value,
	(olMap) => {
		if (!olMap) return

		// debugger
		let line = drawLine(coordinates)
		olMap.addLayer(line)
	}
)
// end地图以及图层显示

// start线
let coordinates = [
	[111.560502648354, 22.760694315193],
	[111.560963988304, 22.760857555675],
	[111.561462879181, 22.761124676043],
	[111.561795473099, 22.761332435968],
	[111.561940312386, 22.761861727681],
	[111.562074422836, 22.762247565207],
	[111.562229990959, 22.762668027937],
	[111.56241774559, 22.763088489372],
	[111.562541127205, 22.763405071245],
	[111.56339943409, 22.763113222357],
	[111.563935875893, 22.762925251557],
	[111.564837098122, 22.763098382567],
	[111.56636595726, 22.762759923935],
	[111.56601190567, 22.762153579244],
]

// 绘制线端函数
const drawLine = (coordinates) => {
	let vectorSource = new VectorSource()
	let vectorLayer = new VectorLayer({
		source: vectorSource,
		style: new Style({
			// fill: new Fill({
			//   color: "rgba(255, 255, 255, 0.1)"
			// }),
			stroke: new Stroke({
				color: 'blue',
				width: 5,
			}),
		}),
	})
	let plygon = new LineString(coordinates, 'XY')
	let feature = new Feature({
		geometry: plygon,
	})
	vectorSource.addFeature(feature)
	return vectorLayer
}

// // 线样式
// const getLineStyle = () => {
// 	var style = new Style({
// 		stroke: new Stroke({
// 			color: '#FF0000',
// 			width: 1.5,
// 		}),
// 	})
// 	return style
// }

// var lineFeature = new Array()
// let lineFeature2 = null
// lines.map((v) => {
// 	lineFeature2 = new Feature({
// 		geometry: new LineString(v),
// 	})
// 	lineFeature2.setStyle(
// 		new Style({
// 			stroke: new Stroke({
// 				color: '#FF0000',
// 				width: 1.5,
// 			}),
// 		})
// 	) // 这种方式可以设置不同样式的线
// 	lineFeature.push(lineFeature2)
// })
// debugger
// var linesSource = new VectorSource({
// 	features: lineFeature,
// })
// var lineLayer = new VectorLayer({
// 	source: linesSource,
// 	style: (feature, resolution) => {
// 		console.log(feature)
// 		return feature.getStyle()
// 	},
// })
// // end线
</script>

<style lang="scss" scoped></style>
