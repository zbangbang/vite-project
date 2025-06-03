<template>
  <div class="flex flex-col items-start text-[#121B27]/80 p-2 rounded mt-3 bg-[#fff]">
    <div class="w-20 self-start mb-1.5">线配置</div>
    <div class="flex justify-start mb-1.5">
      <div class="w-20 self-start mt-1.5">颜色：</div>
      <div class="flex gap-x-2">
        <div class="flex items-center mr-2">
          <el-color-picker show-alpha @change="changeFill" v-model="stroke" />
        </div>
      </div>
    </div>
    <div class="flex justify-start mb-1.5">
      <div class="w-20 self-start mt-1.5">线宽：</div>
      <div class="flex gap-x-2">
        <div class="flex items-center mr-2">
          <el-input v-model.number="strokeWidth" @change="changeSize" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'

const emit = defineEmits(['change'])
const props = withDefaults(
  defineProps<{
    activeObject: any
  }>(),
  {
    activeObject: () => {
      return {
        stroke: 'rgba(255,255,255,0)',
        strokeWidth: 5
      }
    }
  }
)

const change = () => {
  emit('change', {
    type: 'line',
    stroke: stroke.value,
    strokeWidth: strokeWidth.value
  })
}
const stroke = ref('rgba(255,0,0,1)')
const changeFill = () => {
  change()
}
const strokeWidth = ref(2)
const changeSize = () => {
  change()
}

const { activeObject } = toRefs(props)
watch(
  () => activeObject.value,
  (activeObject) => {
    if (activeObject.type !== 'polyline') return
    stroke.value = activeObject.stroke
    strokeWidth.value = activeObject.strokeWidth
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<style lang="scss" scoped></style>
