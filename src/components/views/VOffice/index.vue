<!--
 * @FilePath: index.vue
 * @Author: @zhangl
 * @Date: 2024-03-05 14:13:10
 * @LastEditTime: 2024-04-24 15:28:18
 * @LastEditors: @zhangl
 * @Description:
-->
<template>
  <YDialog
    ref="yDialogRef"
    @cancle="cancle"
    @submit="submitHandle"
    :title="title"
    :footer-visible="footerVisible"
    :options="{ width: '1080px', top: '5vh' }"
    id="only-office-dialog"
  >
    <div class="w-full h-96" id="onlyoffice"></div>
  </YDialog>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, toRefs } from 'vue'
import YDialog from '@/components/common/YDialog/index.vue'
import { ElMessage } from 'element-plus'

const props = withDefaults(
  defineProps<{
    title?: string
    footerVisible?: boolean
  }>(),
  {
    title: '新增',
    footerVisible: true
  }
)

const { title } = toRefs(props)
const emit = defineEmits(['cancle', 'submit'])
// word文档链接
const officeItem = ref<{ docxName: string; url: string; apiJS: string }>()
// 对话框对象
const yDialogRef = ref()
// 初始化
const init = (val: any) => {
  yDialogRef.value.show()
  officeItem.value = val
  if (!officeItem.value || !officeItem.value.url || !officeItem.value.apiJS) {
    ElMessage.warning('暂无相关文档链接')
    return
  }
  editorConfig.document.key = officeItem.value!.docxName
  editorConfig.document.title = officeItem.value!.docxName
  editorConfig.document.url = officeItem.value!.url
  loadScript(officeItem.value!.apiJS)
}
// 取消
const cancle = () => {
  editorConfig.document.key = ''
  editorConfig.document.title = ''
  editorConfig.document.url = ''
  officeItem.value = undefined
  emit('cancle')
  yDialogRef.value.close()
}
// 提交
const submitHandle = () => {
  emit('submit')
  yDialogRef.value.close()
}

onMounted(() => {
  // loadScript()
})

// 加载script文件
const loadScript = (url: string) => {
  const script = document.createElement('script')
  script.src = url
  script.onload = createEditor
  document.head.appendChild(script)
  setTimeout(() => {
    let iframe = document.getElementById('only-office-dialog')!.querySelectorAll('iframe')
    iframe[0].src = iframe[0].src.replace('hsl-main', 'web-apps/apps')
  }, 200)
}

// 编辑器配置项，完整配置项参见：https://api.onlyoffice.com/editors/config/
const editorConfig = {
  // 编辑器宽度
  width: 1000,
  // 编辑器高度
  height: 700,
  // 编辑器类型，支持 word（文档）、cell（表格）、slide（PPT）
  documentType: 'word',
  // 文档配置
  document: {
    // 文件类型
    fileType: 'docx',
    // 文档标识符
    key: 'test1.docx',
    // 文档地址，绝对路径
    url: 'http://124.223.75.119:20053/edit?name=2024年3月04日值班报告_1695442630253600770.docx',
    // 文档标题
    title: '测试文档一.docx'
  },
  editorConfig: {
    lang: 'zh',
    customization: {
      anonymous: {
        request: false,
        label: 'Guest'
      },
      autosave: true
    }
  }
}

let editor
const createEditor = () => {
  nextTick(() => {
    // @ts-ignore
    editor = new window.DocsAPI.DocEditor('onlyoffice', editorConfig)
    console.log(editor)
  })
}

defineExpose({
  init
})
</script>

<style lang="scss" scoped>
.unit {
  margin-bottom: 2px;
  color: #fff;
}
li {
  display: flex;
  align-items: center;
  span:nth-child(1) {
    width: 16px;
    height: 16px;
    margin-right: 10px;
  }
  .value {
    color: #fff;
  }
}
</style>
