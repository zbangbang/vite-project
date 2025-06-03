<!--
 * @FilePath: index.vue
 * @Author: Aouvv Wang
 * @Date: 2024-03-05 16:45:10
 * @LastEditors: @zhangl
 * @LastEditTime: 2024-05-11 14:45:45
 * @Description:
-->
<template>
  <div class="v-dialog">
    <el-dialog
      :title="title"
      :width="width"
      :fullscreen="fullscreen"
      :show-close="false"
      v-model="visible"
    >
      <template #header="{ close }">
        <div class="flex justify-between items-center">
          <div
            class="text-[#fff] text-[18px] border-l-[4px] pl-[12px] border-solid border-[#2197F7]"
          >
            <div class="flex items-center">
              <div class="w-0.5 h-4/5 bg-[#2197F7]"></div>
              <div class="ml-1 text-[#121B27] text-base">{{ title }}</div>
            </div>
          </div>
          <div class="flex items-center cursor-pointer" @click="closeIcon">
            <el-icon><CloseBold /></el-icon>
          </div>
        </div>
      </template>
      <slot></slot>
      <template #footer>
        <slot name="footer"></slot>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { CloseBold } from '@element-plus/icons-vue'
const emit = defineEmits(['close'])
const props = withDefaults(
  defineProps<{
    title: string
    width?: string
    fullscreen?: boolean
  }>(),
  {
    width: '500px',
    fullscreen: false
  }
)

const { title, width } = toRefs(props)

let visible = ref(false)

// 打开
const show = () => {
  visible.value = true
}
const close = () => {
  visible.value = false
}
const closeIcon = () => {
  visible.value = false
  emit('close')
}

defineExpose({
  show,
  close
})
</script>

<style lang="scss">
.v-dialog {
  // height: 100%;
  --el-dialog-bg-color: #fff;
  .el-dialog {
    background: #fff;
    .el-dialog__header {
      color: #121b27;
    }
    .el-dialog__footer {
      padding: 16px 0;
      text-align: center;
      background: #ebeff3;
      // margin: 0 -15px -15px;
    }
    .el-form-item__label {
      color: #121b27;
    }
    .el-dialog__headerbtn .el-dialog__close {
      color: #121b27;
    }
  }
}
</style>
