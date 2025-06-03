<template>
  <div class="flex flex-col items-start text-[#121B27]/80 p-2 rounded mt-3 bg-[#fff]">
    <div class="w-20 self-start mb-1.5">圆圈配置</div>
    <div class="flex justify-start mb-1.5">
      <div class="w-20 self-start mt-1.5">颜色：</div>
      <div class="flex gap-x-2">
        <div class="flex items-center mr-2">
          <el-color-picker show-alpha @change="changeFill" v-model="fill" />
        </div>
      </div>
    </div>
    <div class="flex justify-start mb-1.5">
      <div class="w-20 self-start mt-1.5">边框颜色：</div>
      <div class="flex gap-x-2">
        <div class="flex items-center mr-2">
          <el-color-picker show-alpha @change="changeColor" v-model="stroke" />
        </div>
      </div>
    </div>
    <div class="w-full flex justify-start">
      <div class="w-20 self-start mt-1.5">边框线宽：</div>
      <div class="flex-1 flex items-center ml-2">
        <el-slider :min="1" :max="100" v-model="strokeWidth" @change="changeWidth" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import { FontFamilyArray, FontSizeList } from '../config'

const emit = defineEmits(['change'])
const props = withDefaults(
  defineProps<{
    activeObject: any
  }>(),
  {
    activeObject: () => {
      return {
        fill: 'rgba(255,255,255,0)',
        stroke: 'rgba(255,255,255,1)',
        strokeWidth: 2
      }
    }
  }
)
const { activeObject } = toRefs(props)
watch(
  () => activeObject.value,
  (activeObject) => {
    if (activeObject.type !== 'circle') return
    fill.value = activeObject.fill
    stroke.value = activeObject.stroke
    strokeWidth.value = activeObject.strokeWidth
  }
)

const change = () => {
  emit('change', {
    type: 'circle',
    fill: fill.value,
    stroke: stroke.value,
    strokeWidth: strokeWidth.value
  })
}
const fill = ref('rgba(255,255,255,0)')
const changeFill = () => {
  change()
}
const stroke = ref('rgba(255,255,255,1)')
const changeColor = () => {
  change()
}
const strokeWidth = ref(1)
const changeWidth = () => {
  change()
}
</script>

<style lang="scss" scoped></style>
