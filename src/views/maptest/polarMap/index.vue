<template>
	<div ref="mapRef" class="w-full h-full border border-[#000]">
		<canvas ref="canvasRef" id="polarMap"></canvas>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PolarMap from '@/utils/polarMap/index'
import { mapJson } from './config'

const mapRef = ref()
const canvasRef = ref()
const initCanvas = () => {
	canvasRef.value.width = mapRef.value.clientWidth
	canvasRef.value.height = mapRef.value.clientHeight
	new PolarMap('polarMap', '/json/test.geojson')
}
onMounted(() => {
	initCanvas()
})
</script>

<style lang="scss" scoped></style>
