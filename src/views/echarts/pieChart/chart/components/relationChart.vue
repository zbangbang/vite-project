<!-- GoalAnalysis 组件 的子组件 （台湾外岛攻击目标统计情况 数据）-->
<template>
  <div
    ref="relationChartRef"
    id="relationChartRef"
    style="width: 100%; height: 100%"
  ></div>
</template>

<script>
import { ref, defineComponent, computed } from 'vue'
import * as echarts from 'echarts'
export default defineComponent({
  name: 'pie',
  props: {},
  emits: ['initChart'],
  setup(props, ctx) {
    let data = {
      data: [
        { name: 'aaa', color: '#ff756e' },
        { name: 'bbb', color: '#ff756e' },
        { name: 'ccc ddd', color: '#ff756e' },
        { name: 'eee', color: '#ff756e' },
        { name: 'fff', color: '#ff756e' },
        { name: 'ggg', color: '#ff756e' }
      ],
      link: [
        { source: 'aaa', target: 'bbb', name: '-' },
        { source: 'ccc ddd', target: 'ccc ddd', name: '-' },
        { source: 'eee', target: 'fff', name: '-' },
        { source: 'eee', target: 'ggg', name: '-' }
      ]
    }
    let options = {
      // title: {
      //     text: "生物语义网络图谱",  // 标题
      // },
      tooltip: {
        formatter: function (x) {
          return x.data.des
        }
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          symbolSize: 40, // 圆圈的大小
          zoom: 1,
          roam: true,
          edgeSymbol: ['circle', 'arrow'], // 连接线的箭头设置
          edgeSymbolSize: [4, 10],
          // cursor: 'pointer',
          edgeLabel: {
            // https://echarts.apache.org/zh/option.html#series-graph.edgeLabel
            normal: {
              textStyle: {
                // 节点关系字体大小
                fontSize: 25
                // 节点关系字体颜色
                // color:'#00ff00',
              },
              show: true, // 是否显示节点关系值。
              formatter: function (x) {
                // 节点之间的关系数据，我这边的数据是link中的name字段值
                return x.data.name
              }
            }
          },
          force: {
            // https://echarts.apache.org/zh/option.html#series-graph.force
            // 节点之间的斥力范围,值越大斥力越大，可以是恒定值也可以是数组
            // repulsion: 90,
            // repulsion: [90, 170],
            // // 节点之间的斥力因子，即连接线的长度
            // edgeLength: 250,
            // // 节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
            // gravity: 0.02
            // initLayout: 'circular'
            gravity: 0,
            repulsion: 0,
            edgeLength: 200
          },
          draggable: true, // 节点是否可拖拽，只在使用力引导布局的时候有用。 https://echarts.apache.org/zh/option.html#series-graph.draggable
          label: {
            // https://echarts.apache.org/zh/option.html#series-graph.label
            show: true, // 是否显示字体
            // 节点的字体大小和颜色设置
            fontSize: 14,
            color: '#fff'
          },
          itemStyle: {
            // https://echarts.apache.org/zh/option.html#series-graph.itemStyle
            normal: {
              // 节点的边框，即描边，设置描边的颜色、宽度、线形
              // borderColor: "#000",  // 边框颜色
              // borderWidth: 2,
              // borderType: 'solid',
              // 节点颜色
              color: function (params) {
                // 圆圈的背景色
                return params.data.color // 根据后端数据指定的颜色
                // return "#00ff00"    //前端写死的颜色
              }
            }
          },
          data: data.data,
          links: data.link,
          lineStyle: {
            // https://echarts.apache.org/zh/option.html#series-graph.lineStyle
            normal: {
              // 连接线的宽度和颜色
              width: 3,
              color: '#4b565b'
              // color: '#00ff00',
              // type: 'solid' // 连接线的线形
            }
          }
        }
      ]
    }
    const relationChartRef = ref()
    const resizeChart = () => {
      relationChartRef.value.resize()
    }
    const initChart = chartData => {
      if (
        echarts.getInstanceByDom(document.getElementById('relationChartRef'))
      ) {
        echarts
          .getInstanceByDom(document.getElementById('relationChartRef'))
          .clear()
      }
      const myChart = echarts.init(document.getElementById('relationChartRef'))
      // options.series[0].data = chartData;
      myChart.setOption(options)
      relationChartRef.value = myChart
    }
    return {
      relationChartRef,
      resizeChart,
      initChart
    }
  }
})
</script>

<style scoped lang="scss"></style>
