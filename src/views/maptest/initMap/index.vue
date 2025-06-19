<template>
	<div ref="mapRef" class="w-full h-full border border-[#000]">
		<canvas ref="canvasRef"></canvas>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MapBook from '@/utils/mapbook/MapBook'

const mapRef = ref()
const canvasRef = ref()
const initCanvas = () => {
	canvasRef.value.width = mapRef.value.clientWidth
	canvasRef.value.height = mapRef.value.clientHeight

	new MapBook(canvasRef.value, {
		zoom: 12,
	})
}
onMounted(() => {
	initCanvas()
})
</script>

<style lang="scss" scoped></style>
