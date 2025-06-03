<!--
 * @FilePath: imgList.vue
 * @Author: @zhangl
 * @Date: 2024-05-16 16:30:10
 * @LastEditTime: 2024-05-16 20:55:49
 * @LastEditors: @zhangl
 * @Description:
-->

<template>
  <div class="h-full bg-[#fff]/60 p-2">
    <el-scrollbar max-height="700">
      <div
        class="w-64 h-32 px-1 pb-2 pt-6 bg-[#fff] relative cursor-pointer"
        :class="[index !== 0 ? 'mt-1' : '', imgIndex === index ? 'bg-[#fff]/50' : '']"
        v-for="(item, index) in list"
        @click="changeImg(item, index)"
      >
        <el-image style="width: 100%; height: 100%" fit="contain" :src="item.url"></el-image>
        <div class="w-full absolute top-1 left-1/2 -translate-x-1/2 text-[#121B27] text-center">
          {{ item.time }}
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue'

const emit = defineEmits(['change'])
const props = withDefaults(
  defineProps<{
    list: any[]
    imgIndex: number
  }>(),
  {
    list: () => [],
    imgIndex: 0
  }
)

const { list, imgIndex } = toRefs(props)

const changeImg = (item: any, index: number) => {
  emit('change', item, index)
}
</script>

<style lang="scss"></style>
