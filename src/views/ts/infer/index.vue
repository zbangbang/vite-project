<template>
  <el-descriptions title="Customized style list" :column="1" border>
    <el-descriptions-item
      label="获取数组中元素类型"
      label-align="right"
      align="left"
      width="30%"
      >{{ aType }}</el-descriptions-item
    >
    <el-descriptions-item label="Telephone" label-align="right" align="center"
      >18100000000</el-descriptions-item
    >
    <el-descriptions-item label="Place" label-align="right" align="center"
      >Suzhou</el-descriptions-item
    >
  </el-descriptions>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 获取数组中元素类型
type T0 = string[]
type PickType<T> = T extends (infer R)[] ? R : never
type P0 = PickType<T0>
const aType = ref<P0>()
</script>

<style lang="scss" scoped></style>
