<template>
  <div class="top">
    <slot name="top"> top </slot>
  </div>
  <div class="center">
    <div v-for="item in data" :key="item.type">
      <slot name="center" :msg="item" :test="item"> </slot>
    </div>
  </div>
  <div class="bottom">
    <slot name="bottom"> bottom </slot>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

type listItem = {
  name: string
  type: string
  [propName: string]: any
}
const data = reactive<listItem[]>([
  {
    name: '111',
    type: 't1',
    value: 1
  },
  {
    name: '222',
    type: 't2',
    value: 2
  },
  {
    name: '333',
    type: 't3'
  }
])
</script>

<style lang="scss" scoped></style>
