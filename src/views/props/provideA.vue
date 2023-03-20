<template>
  <div class="provide-item">
    <span>子组件</span>
    <input v-model="msg" type="text" />
    <input v-model="propRawData" />
  </div>
  <provide-b></provide-b>
</template>

<script lang="ts" setup>
import { computed, inject, Ref } from 'vue'
import ProvideB from '@/views/props/provideB.vue'

const msg = inject<Ref<string>>('msg')

const props = defineProps(['rawData'])
const emit = defineEmits(['update:rawData'])
const propRawData = computed({
  get: () => {
    console.log('object')
    return props.rawData
  },
  set: (val: string) => {
    emit('update:rawData', val)
  }
})
</script>

<style lang="scss" scoped></style>
