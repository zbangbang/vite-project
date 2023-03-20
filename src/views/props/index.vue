<template>
  <div class="provide">
    <div class="provide-item">
      <span>父组件</span>
      <input v-model="msg" type="text" />
    </div>
    <provide-a :rawData="rawData"></provide-a>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import ProvideA from '@/views/props/provideA.vue'

const msg = ref('测试')
provide('msg', msg)

const color = ref<string>('#981a00')

const rawData = ref('123')
</script>

<style lang="scss" scoped>
.provide-item {
  span {
    color: v-bind(color);
  }
}
</style>
<style lang="scss">
.provide {
  .provide-item {
    height: 80px;
    display: flex;
    align-items: center;
  }
}
</style>
