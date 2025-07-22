<template>
	<div class="w-full h-full flex">
		<!-- <InitMap></InitMap> -->
		<!-- <GridLayer></GridLayer> -->
		<!-- <WindLayer></WindLayer> -->
		<!-- <WindCanvasLayer></WindCanvasLayer> -->
		<!-- <WindPlume></WindPlume> -->
		<!-- <FlowLayer></FlowLayer> -->
		<!-- <Typhoon></Typhoon> -->
		<Preview></Preview>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InitMap from '@/components/mapbox/initMap/index.vue'
import GridLayer from '@/components/mapbox/Layer/GridLayer.vue'
import WindLayer from '@/components/mapbox/Wind/index.vue'
import WindCanvasLayer from '@/components/mapbox/Wind/canvas.vue'
import WindPlume from '@/components/mapbox/Wind/plume.vue'
import FlowLayer from '@/components/mapbox/Wind/flow.vue'
import Typhoon from '@/components/mapbox/Typhoon/index.vue'
import Preview from '@/components/mapbox/preview/index.vue'
</script>

<style lang="scss" scoped></style>
