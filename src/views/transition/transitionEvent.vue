<template>
  <div class="transition-div">
    <div style="background: aquamarine;width: 50px;height: 30px;line-height: 30px;text-align: center;cursor: pointer;"
         @click="flag1 = !flag1">按钮
    </div>
    <transition
        @before-enter="beforeEnter"
        @enter="enter"
        @leave="leave"
    >
      <div v-if="flag1">
        12312312313
      </div>

    </transition>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
// 获取vue实例
const { proxy } = getCurrentInstance()!
// 第二个动画区域
const flag1 = ref<boolean>(true)
const beforeEnter = (el: Element) => {
  proxy?.$gsap.set(el, {
    fontSize: '16px',
    opacity: 0
  })
  console.log('进入之前', el)
}
const enter = (el: Element, done: gsap.Callback) => {
  proxy?.$gsap.to(el, {
    fontSize: '20px',
    opacity: 1,
    onComplete: done
  })
  console.log('进入', el)
}
const leave = (el: Element) => {
  proxy?.$gsap.to(el, {
    opacity: 0
  })
  console.log('离开', el)
}
</script>

<style lang="scss" scoped>

</style>