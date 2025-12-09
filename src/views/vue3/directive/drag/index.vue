<template>
  <div class="drag-box" v-draggable>12312123</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
</script>

<style lang="scss" scoped>
.drag-box {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 100px;
  height: 100px;
  background-color: bisque;
  user-select: none;
}
</style>
