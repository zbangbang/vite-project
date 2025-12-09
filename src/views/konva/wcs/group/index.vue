<template>
  <div class="konva-box" id="konvaBox" ref="konvaBoxRef"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Konva from 'konva'

// 初始化绘制
let stageStyle: {
  width: number
  height: number
} = {
  width: 0,
  height: 0
}
const konvaBoxRef = ref<HTMLDivElement>()
let stageContent = null
let stageLayer = null
let layerGroup = null
let imgTransformer: Konva.Transformer
const initStage = () => {
  stageStyle.width = konvaBoxRef.value!.clientWidth
  stageStyle.height = konvaBoxRef.value!.clientHeight

  stageContent = new Konva.Stage({
    container: 'konvaBox',
    ...stageStyle
  })
  // 图层
  stageLayer = new Konva.Layer()
  stageContent.add(stageLayer)

  // 创建初始图层组并添加数据
  layerGroup = new Konva.Group()
  stageLayer.add(layerGroup)

  // transformer 集合，添加到nodes中即可控制
  imgTransformer = new Konva.Transformer({
    nodes: [],
    keepRatio: false,
    anchorCornerRadius: 10,
    anchorSize: 15,
    rotationSnaps: [0, 90, 180, 270]
    // enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
  })
  layerGroup.add(imgTransformer)
}

onMounted(() => {
  initStage()
})
</script>

<style lang="scss" scoped>
.konva-box {
  width: 100%;
  height: 100%;
}
</style>
