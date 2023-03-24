<template>
  <div class="chart-box">
    <relation-chart ref="relationChartRef"></relation-chart>
    <les-miserables ref="lesMiserablesRef"></les-miserables>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import RelationChart from './components/relationChart.vue'
import LesMiserables from './components/lesMiserables.vue'

const relationChartRef = ref()
onMounted(() => {
  relationChartRef.value.initChart()
})
const lesMiserablesRef = ref()
onMounted(() => {
  lesMiserablesRef.value.initChart()
})
</script>

<style lang="scss" scoped>
.chart-box {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 80%;
  height: 80%;
  display: flex;
  // background-color: bisque;
  // user-select: none;
}
</style>
