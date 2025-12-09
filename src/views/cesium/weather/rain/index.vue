<template>
  <div class="cesiumContainer" id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { getCurrentInstance, inject, onMounted, onUnmounted, ref } from 'vue'
import * as Cesium from 'cesium'
import Weather from '@/utils/CesiumWeather'
const { proxy } = getCurrentInstance()!
let viewer: Cesium.Viewer

onMounted(() => {
  proxy!.$Viewer = new Cesium.Viewer('cesiumContainer', {
    infoBox: false,
    contextOptions: {
      requestWebgl1: true
    }
  })
  viewer = proxy!.$Viewer

  const weather = new Weather(viewer)
  weather.rain()
})
onUnmounted(() => {
  viewer.destroy()
})
</script>

<style lang="scss" scoped>
.cesiumContainer {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
