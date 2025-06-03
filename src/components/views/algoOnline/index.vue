<!--
 * @FilePath: index.vue
 * @Author: Aouvv Wang
 * @Date: 2024-03-18 17:00:38
 * @LastEditors: Aouvv Wang
 * @LastEditTime: 2024-05-10 09:47:04
 * @Description: 
-->
<template>
  <div class="overflow-y-auto h-full w-[70%] max-w-[70%]">
    <div class="item">
      <div class="title">算法描述</div>
      <div class="intro">
        <p class="">{{ onlineInfo.remark || '无' }}</p>
      </div>
    </div>
    <div class="item">
      <div class="title">URL</div>
      <div class="intro">
        <p class="">{{ onlineInfo.url || '无' }}</p>
      </div>
    </div>
    <div class="item">
      <div class="title">请求方式</div>
      <div class="intro">
        <p class="">{{ onlineInfo.funType || '无' }}</p>
      </div>
    </div>
    <div class="item">
      <div class="title">请求参数</div>
      <div class="intro">
        <task-table :column="baseColumn" :data="baseData">
          <template #custom="{ row, prop }">{{ row[prop] ? '是' : '否' }} </template></task-table
        >
      </div>
    </div>
    <div class="item">
      <div class="title">返回样例</div>
      <div class="intro bg-[#002442] p-[14px] max-h-[500px] overflow-y-auto">
        <pre>{{ JSON.parse(onlineInfo.sample || '{}') }}</pre>
      </div>
    </div>
    <div class="item">
      <div class="title">算法测试</div>
      <div class="intro">
        <task-table :column="testColumn" :data="testData">
          <template #custom="{ row, prop }">
            <el-input v-model="row[prop]"></el-input>
          </template>
        </task-table>
      </div>
      <div class="text-center mt-[12px]">
        <el-button
          type="success"
          size="large"
          rounded
          class="mt-[10px] w-[120px]"
          @click="testOnce()"
        >
          <span class="mr-[4px]">测试</span>
          <el-icon size="24"> <SvgIcon name="test"></SvgIcon> </el-icon>
        </el-button>
      </div>
    </div>
    <div class="item">
      <div class="title">返回结果</div>
      <div class="intro bg-[#002442] p-[14px] max-h-[500px] overflow-y-auto">
        <pre>{{ JSON.parse(onlineInfo.backResult || '{}') }}</pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import type { IOnlineInfo } from './config'
import TaskTable from '@/components/common/YTable/index.vue'
import type { ITableColumn } from '@/components/common/YTable/config'
import SvgIcon from '@/components/common/SvgIcon/index.vue'

const props = withDefaults(
  defineProps<{
    baseColumn: ITableColumn[]
    baseData: any[]
    testColumn: ITableColumn[]
    testData: any[]
    onlineInfo: IOnlineInfo
  }>(),
  {}
)

const { baseColumn, baseData, testColumn, testData, onlineInfo } = toRefs(props)

const emit = defineEmits<{
  (evt: 'test', testData: any[]): void
}>()

const testOnce = () => {
  emit('test', testData.value)
}
</script>

<style lang="scss" scoped>
.item {
  margin-bottom: 26px;
}
.title {
  font-size: 16px;
  color: #fff;
  margin-bottom: 6px;
}
.intro {
  font-size: 14px;
  color: #ebeff3;
  p {
    margin-bottom: 12px;
  }
}
::v-deep(.el-input__wrapper) {
  background: #ebeff3;
  box-shadow: none !important;
}
</style>
