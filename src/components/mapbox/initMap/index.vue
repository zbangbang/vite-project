<template>
	<div class="w-full h-full" id="container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import ZMapbox from '@z/mapbox-z'

const ymap = shallowRef<ZMapbox>()
const initMap = () => {
	ymap.value = new ZMapbox({
		container: 'container',
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

onMounted(() => {
	initMap()
})
</script>

<style lang="scss" scoped></style>
