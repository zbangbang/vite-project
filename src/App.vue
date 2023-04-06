<template>
  <layout></layout>
</template>

<script setup lang="ts">
import Layout from 'layouts/index.vue'
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()!
setTimeout(() => {
  console.log(proxy?.$Viewer)
}, 5000)
</script>

<style lang="scss" scoped></style>
