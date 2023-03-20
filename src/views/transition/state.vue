<template>
  <div>
    <input step="20" v-model="numObj.inputNum" type="number"/>
    <div>{{ numObj.realNum.toFixed(0) }}</div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, ref, watch } from 'vue'

const { proxy } = getCurrentInstance()!

type numObjType = {
  inputNum: number
  realNum: number
}
const numObj: numObjType = reactive({
  inputNum: 0,
  realNum: 0
})
// 监听输入，过渡显示
watch(() => numObj.inputNum, (newValue, oldValue) => {
  proxy?.$gsap.to(numObj, {
    duration: 1,
    realNum: newValue
  })
})

</script>

<style lang="scss" scoped>

</style>