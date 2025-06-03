<!--
 * @FilePath: table.vue
 * @Author: @zhangl
 * @Date: 2024-05-29 11:52:53
 * @LastEditTime: 2024-05-30 11:17:53
 * @LastEditors: @zhangl
 * @Description:
-->
<template>
  <div
    class="absolute right-[calc(100%+20px)] bottom-3 w-[400px] h-72 bg-[#fff] p-2 rounded flex flex-col shadow-lg"
  >
    <div
      class="text-[#fff] text-lg border-l-4 pl-[12px] border-solid border-[#2197F7] h-6 flex items-center justify-between mb-2"
    >
      <div class="flex items-center">
        <div class="w-0.5 h-4/5 bg-[#2197F7]"></div>
        <div class="text-[#121B27] text-base">表格制作</div>
      </div>
      <div class="flex items-center cursor-pointer" @click="cancle">
        <el-icon color="#121B27"><Close /></el-icon>
      </div>
    </div>
    <div class="flex">
      <div class="flex w-32">
        <div class="w-10">行数</div>
        <el-input-number size="small" :min="1" v-model="tableRow" @change="changeRow" />
      </div>
      <div class="flex w-32 ml-2">
        <div class="w-10">列数</div>
        <el-input-number size="small" :min="1" v-model="tableCol" @change="changeCol" />
      </div>
      <div class="ml-2">
        <el-button size="small" type="primary" @click="create">生成</el-button>
        <el-button size="small" @click="clear">清空</el-button>
      </div>
    </div>
    <ul
      id="ul-table"
      class="flex-1 flex flex-col my-3"
      @click="clickTableItem"
      @keyup.enter="enter"
    >
      <li
        v-for="(rowItem, rowIndex) in tableData"
        class="flex-1 flex justify-center items-center"
        :class="[rowIndex === 0 ? 'bg-[#eee]' : '']"
      >
        <div
          class="h-full flex justify-center items-center border border-[#8291A9]"
          :style="{ width: `${(1 / rowItem.length) * 100}%` }"
          v-for="(colItem, colIndex) in rowItem"
        >
          <div
            :data-row="rowIndex"
            :data-col="colIndex"
            v-if="!colItem.flag"
            class="w-full h-full flex justify-center items-center overflow-hidden text-nowrap"
          >
            {{ colItem.text }}
          </div>
          <el-input
            :id="`table-input-${rowIndex}-${colIndex}`"
            v-else
            v-model="colItem.text"
            @blur="blurEvent"
          ></el-input>
          <!-- {{ `${rowIndex}-${colIndex}` }} -->
        </div>
      </li>
    </ul>
    <div class="rounded h-12 -mx-2 -mb-2 flex justify-center gap-x-2">
      <el-button type="info" @click="cancle">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, toRaw } from 'vue'
import { Close } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'

const emit = defineEmits(['save', 'cancle'])

const tableRow = ref(4)
const changeRow = () => {}
const tableCol = ref(3)
const changeCol = () => {}

const tableData = ref()
onMounted(() => {
  tableData.value = []
  for (let i = 0; i < tableRow.value; ++i) {
    let arr = []
    for (let j = 0; j < tableCol.value; ++j) {
      let obj = {
        text: '',
        flag: false
      }
      arr.push(obj)
    }
    tableData.value.push(arr)
  }
})
const reset = () => {
  tableData.value = []
  for (let i = 0; i < tableRow.value; ++i) {
    let arr = []
    for (let j = 0; j < tableCol.value; ++j) {
      let obj = {
        text: '',
        flag: false
      }
      arr.push(obj)
    }
    tableData.value.push(arr)
  }
}
/**
 * @Date: 2024-05-29 15:07:22
 * @Description: 根据行列生成，将原表格数据更新同步
 * @return {*}
 */
const create = () => {
  const tableList = toRaw(tableData.value)
  const row = tableList.length
  const col = tableList[0].length
  tableData.value = []
  for (let i = 0; i < tableRow.value; ++i) {
    let arr = []
    for (let j = 0; j < tableCol.value; ++j) {
      let obj = {
        text: '',
        flag: false
      }
      if (row > i && col > j) {
        obj.text = tableList[i][j].text
      }

      arr.push(obj)
    }
    tableData.value.push(arr)
  }
}
const clear = () => {
  tableData.value.forEach((item: any) => {
    item.forEach((it: any) => {
      it.flag = false
      it.text = ''
    })
  })
}

/**
 * @Date: 2024-05-29 15:03:35
 * @Description: 点击进行输入，默认聚焦
 * @param {*} e
 * @return {*}
 */
const clickTableItem = (e: any) => {
  const row = e.target.dataset.row
  const col = e.target.dataset.col
  if (row === undefined && col === undefined) {
    return
  }
  tableData.value.forEach((item: any) => {
    item.forEach((it: any) => {
      it.flag = false
    })
  })
  tableData.value[row][col].flag = !tableData.value[row][col].flag

  if (tableData.value[row][col].flag) {
    nextTick(() => {
      document.getElementById(`table-input-${row}-${col}`)!.focus()
    })
  }
}
/**
 * @Date: 2024-05-29 15:03:43
 * @Description: 回车确认
 * @return {*}
 */
const enter = () => {
  tableData.value.forEach((item: any) => {
    item.forEach((it: any) => {
      it.flag = false
    })
  })
}

/**
 * @Date: 2024-05-30 10:51:05
 * @Description: input失去焦点
 * @param {*} e
 * @return {*}
 */
const blurEvent = (e: any) => {
  const ids = e.target.id.split('-')
  tableData.value[ids[2]][ids[3]].flag = false
}

/**
 * @Date: 2024-05-29 15:47:43
 * @Description: 保存并通知
 * @return {*}
 */
const save = () => {
  nextTick(() => {
    html2canvas(document.getElementById('ul-table')!).then((canvas) => {
      emit('save', canvas.toDataURL())
    })
  })
}
/**
 * @Date: 2024-05-29 16:29:50
 * @Description: 取消
 * @return {*}
 */
const cancle = () => {
  emit('cancle')
}

defineExpose({
  reset
})
</script>

<style lang="scss" scoped></style>
