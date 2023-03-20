<template>
  <div class="provide-item">
    <span>孙子组件</span>
    <input type="button" value="change" @click="change" />
    <input v-model="msg" type="text" />
  </div>
</template>

<script setup lang="ts">
import { inject, Ref, ref } from 'vue'

const msg = inject<Ref<string>>('msg')
const change = () => {
  msg!.value = '孙子组件修改值了'
}
</script>

<style lang="scss" scoped></style>
