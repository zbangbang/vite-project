<template>
  <div>
    <el-button @click="sort">乱序</el-button>
    <transition-group class="wraps" tag="div">
      <div class="items group-ani" v-for="item in list" :key="item.id">
        {{ item.number }}
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'

const { proxy } = getCurrentInstance()!

// 定义结构类型
type numberType = {
  id: number,
  number: number
}
const list = ref<numberType[]>(Array(81).fill({ id: 0, number: 0 }).map((item, index) => {
  return {
    id: index,
    number: (index % 9) + 1
  }
}))
const sort = () => {
  list.value = proxy?.$lodash.shuffle(list.value) as numberType[]
}

</script>

<style lang="scss" scoped>
.wraps {
  display: flex;
  flex-wrap: wrap;
  width: calc(30px * 9 + 18px);

  .items {
    width: 30px;
    height: 30px;
    border: 1px solid;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .group-ani {
    transition: all 1s;
  }
}
</style>