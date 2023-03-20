<template>
  <header>{{ title }}</header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  title: string
}>(), {
  title: 'header'
})

// const emits = defineEmits(['send'])
// emits('send', 123)

defineExpose({
  send: (e: number) => {
    console.log(e)
  }
})


</script>

<style lang="scss" scoped>
header {
  height: 100px;
  padding: 10px;
  border: 1px solid #ccc;
}
</style>