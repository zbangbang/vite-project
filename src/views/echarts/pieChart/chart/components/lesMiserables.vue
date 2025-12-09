<!-- GoalAnalysis 组件 的子组件 （台湾外岛攻击目标统计情况 数据）-->
<template>
  <div
    ref="lesMiserablesRef"
    id="lesMiserablesRef"
    style="width: 100%; height: 100%"
  ></div>
</template>

<script>
import { ref, defineComponent, computed } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

export default defineComponent({
  name: 'pie',
  props: {},
  emits: ['initChart'],
  setup(props, ctx) {
    let option = null
    const fetchJsonData = async () => {
      await axios.get('/json/les-miserables.json').then(res => {
        console.log(res, 'res')
        const graph = res.data
        graph.nodes.forEach(function (node) {
          node.label = {
            show: node.symbolSize > 30
          }
        })

        option = {
          title: {
            text: 'Les Miserables',
            subtext: 'Default layout',
            top: 'bottom',
            left: 'right'
          },
          tooltip: {},
          legend: [
            {
              // selectedMode: 'single',
              data: graph.categories.map(function (a) {
                return a.name
              })
            }
          ],
          animationDuration: 1500,
          animationEasingUpdate: 'quinticInOut',
          series: [
            {
              name: 'Les Miserables',
              type: 'graph',
              layout: 'none',
              data: graph.nodes,
              links: graph.links,
              categories: graph.categories,
              roam: true,
              label: {
                position: 'right',
                formatter: '{b}'
              },
              lineStyle: {
                color: 'source',
                curveness: 0.3
              },
              emphasis: {
                focus: 'adjacency',
                lineStyle: {
                  width: 10
                }
              }
            }
          ]
        }
      })
    }
    const lesMiserablesRef = ref()
    const resizeChart = () => {
      lesMiserablesRef.value.resize()
    }
    const initChart = async chartData => {
      await fetchJsonData()
      if (
        echarts.getInstanceByDom(document.getElementById('lesMiserablesRef'))
      ) {
        echarts
          .getInstanceByDom(document.getElementById('lesMiserablesRef'))
          .clear()
      }
      const myChart = echarts.init(document.getElementById('lesMiserablesRef'))
      // options.series[0].data = chartData;
      myChart.setOption(option)
      lesMiserablesRef.value = myChart
    }
    return {
      lesMiserablesRef,
      resizeChart,
      initChart
    }
  }
})
</script>

<style scoped lang="scss"></style>
