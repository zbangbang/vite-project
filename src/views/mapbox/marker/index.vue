<template>
	<div class="w-full h-full border">
		<div class="w-full h-full" id="mapbox-container"></div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import mapboxgl from 'mapbox-gl'
import { randomNum } from '@/utils'

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
		// initOneMarker()
		// initTwoMarker()
		initThreeMarker()
	})
}
onMounted(() => {
	initMap()
})

const initOneMarker = () => {
	const id = 'one'
	const demoFeatures: GeoJSON.Feature[] = Array(1000)
		.fill(0)
		.map((item, index) => {
			return {
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [randomNum(-180, 180), randomNum(-90, 90)],
				},
				properties: {
					index,
					name: 'point' + index,
				},
			}
		})

	console.log(demoFeatures)

	smap.value?.addSource(`${id}-source`, {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: demoFeatures,
		},
	})

	smap.value?.addLayer({
		id: `${id}-layer`,
		type: 'circle',
		source: `${id}-source`,
		layout: {
			// 'text-field': ['get', 'name'],
			// 'text-size': 12,
		},
		paint: {
			'circle-color': '#f00',
			'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 6, 16],
		},
	})
	smap.value?.addLayer({
		id: `${id}-text-layer`,
		type: 'symbol',
		source: `${id}-source`,
		layout: {
			'text-field': ['get', 'name'],
			'text-size': 12,
			'text-allow-overlap': false,
		},
		paint: {},
	})

	smap.value?.on('zoom', (e) => {
		console.log(smap.value?.getZoom())
		if (smap.value?.getZoom()! > 6) {
			smap.value?.setLayoutProperty(
				`${id}-text-layer`,
				'text-allow-overlap',
				true
			)
		}
	})
}
const initTwoMarker = () => {
	const id = 'two'
	const demoFeatures: GeoJSON.Feature[] = Array(1000)
		.fill(0)
		.map((item, index) => {
			return {
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [randomNum(-180, 180), randomNum(-90, 90)],
				},
				properties: {
					index,
					name: 'point' + index,
					temp: randomNum(0, 50),
					vis: randomNum(0, 2),
				},
			}
		})

	console.log(demoFeatures)

	smap.value?.addSource(`${id}-source`, {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: demoFeatures,
		},
	})

	smap.value?.addLayer({
		id: `${id}-layer`,
		type: 'circle',
		source: `${id}-source`,
		layout: {
			// 'text-field': ['get', 'name'],
			// 'text-size': 12,
		},
		paint: {
			'circle-color': '#f00',
			'circle-radius': 6,
		},
		filter: [
			'all',
			['>', ['get', 'temp'], 10],
			['<', ['get', 'temp'], 40],
			['<', ['get', 'vis'], 1],
		],
	})
	smap.value?.addLayer({
		id: `${id}-text-layer`,
		type: 'symbol',
		source: `${id}-source`,
		layout: {
			'text-field': ['concat', ['get', 'temp'], '℃', ['get', 'vis'], 'km'],
			'text-size': 12,
			'text-allow-overlap': true,
		},
		paint: {},
		filter: [
			'all',
			['>', ['get', 'temp'], 10],
			['<', ['get', 'temp'], 40],
			['<', ['get', 'vis'], 1],
		],
	})
}
const initThreeMarker = () => {
	const id = 'three'
	const demoFeatures: GeoJSON.Feature[] = Array(1000)
		.fill(0)
		.map((item, index) => {
			return {
				type: 'Feature',
				id: index,
				geometry: {
					type: 'Point',
					coordinates: [randomNum(-180, 180), randomNum(-90, 90)],
				},
				properties: {
					index,
					name: 'point' + index,
					temp: randomNum(0, 50),
					vis: randomNum(0, 2),
					click: false,
				},
			}
		})

	console.log(demoFeatures)

	smap.value?.addSource(`${id}-source`, {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: demoFeatures,
		},
	})

	smap.value?.addLayer({
		id: `${id}-layer`,
		type: 'circle',
		source: `${id}-source`,
		paint: {
			'circle-color': '#f00',
			'circle-radius': [
				'case',
				['boolean', ['feature-state', 'click'], false],
				10,
				6,
			],
		},
	})
	smap.value?.addLayer({
		id: `${id}-text-layer`,
		type: 'symbol',
		source: `${id}-source`,
		layout: {
			'text-field': ['concat', ['get', 'temp'], '℃', ['get', 'vis'], 'km'],
			'text-size': 12,
			'text-allow-overlap': true,
			visibility: [
				'case',
				['boolean', ['feature-state', 'click'], false],
				'visible',
				'none',
			],
		},
		paint: {},
	})

	let lastFeatureId: any
	smap.value?.on('click', `${id}-layer`, (e) => {
		console.log(e.features[0])
		let featureId = e.features[0].id

		smap.value?.setFeatureState(
			{
				source: `${id}-source`,
				id: featureId,
			},
			{
				click: true,
			}
		)

		lastFeatureId = featureId
	})
	smap.value?.on('click', `${id}-text-layer`, (e) => {
		console.log(e.features[0])
	})
}
</script>

<style lang="scss" scoped></style>
