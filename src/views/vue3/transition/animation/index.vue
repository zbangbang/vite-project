<template>
  <div class="transition-div">
    <div
      style="
        background: aquamarine;
        width: 50px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        cursor: pointer;
      "
      @click="flag = !flag"
    >
      按钮
    </div>
    <transition
      enter-active-class="animate__animated animate__fadeInDown"
      leave-active-class="animate__animated animate__fadeOutDown"
    >
      <div v-if="flag">
        <SlotVue>
          <template #top> 最上面 </template>
          <template #center="{ msg, test }"> {{ msg }} -- {{ test }} </template>
          <template #[slotName]> 最下面 </template>
        </SlotVue>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import SlotVue from '@/components/slotVue/index.vue'

let slotName = ref<string>('bottom')

const flag = ref<boolean>(true)
</script>

<style lang="scss" scoped></style>
