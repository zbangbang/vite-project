<template>
  <div class="flex items-center text-[#121B27]/80 mt-3">
    <div class="w-20 self-start mt-1.5">文字：</div>
    <div class="flex items-center flex-wrap mr-2 cursor-pointer">
      <div class="flex gap-x-2">
        <el-select
          v-model="fontFamily"
          popper-class="dm-select"
          style="width: 80px"
          placeholder="字体"
          @change="changeFamily"
        >
          <el-option v-for="item in FontFamilyArray" :key="item" :label="item" :value="item" />
        </el-select>
        <el-select
          v-model="fontSize"
          popper-class="dm-select"
          style="width: 80px"
          placeholder="大小"
          @change="changeSize"
        >
          <el-option
            v-for="item in FontSizeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div class="flex items-center mr-2">
          <el-color-picker @change="changeColor" v-model="fontColor" />
        </div>
      </div>
      <div class="mt-3" @click="addLabel">
        <span class="underline underline-offset-2 ml-2 cursor-pointer">添加文字</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import { FontFamilyArray, FontSizeList } from '../config'

const emit = defineEmits(['changeFamily', 'changeSize', 'changeColor', 'add'])
const props = withDefaults(
  defineProps<{
    activeObject: any
  }>(),
  {
    activeObject: () => {
      return {
        fontFamily: '方正楷体',
        fontSize: 16,
        fontColor: '#fff'
      }
    }
  }
)
const { activeObject } = toRefs(props)

watch(
  () => activeObject.value,
  (activeObject) => {
    if (activeObject.type !== 'f-text') return
    fontFamily.value = activeObject.fontFamily
    fontSize.value = activeObject.fontSize
    fontColor.value = activeObject.fill
  }
)

const fontFamily = ref(FontFamilyArray[0])
const changeFamily = () => {
  emit('changeFamily', fontFamily.value)
}
const fontSize = ref(16)
const changeSize = () => {
  emit('changeSize', fontSize.value)
}
const fontColor = ref('#fff')
const changeColor = () => {
  emit('changeColor', fontColor.value)
}

const addLabel = () => {
  emit('add')
}
</script>

<style lang="scss" scoped></style>
