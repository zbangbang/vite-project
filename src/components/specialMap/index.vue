<!--
 * @FilePath: index.vue
 * @Author: @zhangl
 * @Date: 2024-05-29 11:52:53
 * @LastEditTime: 2024-12-04 17:42:57
 * @LastEditors: @zhangl
 * @Description:
-->
<template>
	<VDialog
		ref="vDialogRef"
		title="专题图制作"
		fullscreen
		class="check-flow-dialog editor-dialog"
		@close="checkCancle"
	>
		<template #default>
			<div class="h-full flex flex-col">
				<div class="flex-1 bg-[#EBEFF3] mb-2 flex">
					<ImgList
						:index="nowImageIndex"
						:list="imageList"
						@change="changeActiveImage"
					></ImgList>
					<div class="relative h-full flex-1 flex items-center">
						<div ref="workspaceRef" id="workspace" class="w-full h-full">
							<canvas ref="canvasRef" id="canvas" />
						</div>
						<div class="absolute right-2 top-2">
							<el-tooltip content="选择" placement="bottom" effect="light">
								<el-button
									class="!pl-1 !pr-0"
									type="plain"
									text
									@click="changeEnable(false)"
								>
									<el-icon size="24" :color="panEnable ? '#ccc' : '#000'"
										><Pointer
									/></el-icon>
								</el-button>
							</el-tooltip>
							<el-tooltip content="拖拽" placement="bottom" effect="light">
								<el-button
									class="!pr-1 !pl-0"
									type="plain"
									text
									@click="changeEnable(true)"
								>
									<el-icon size="24" :color="panEnable ? '#000' : '#ccc'"
										><Rank
									/></el-icon>
								</el-button>
							</el-tooltip>
							<el-tooltip content="上一步" placement="bottom" effect="light">
								<el-button class="!pr-1 !pl-0" type="plain" text @click="undo">
									<el-icon size="24" :color="haveUndo ? '#000' : '#ccc'"
										><RefreshLeft
									/></el-icon>
								</el-button>
							</el-tooltip>
							<el-tooltip content="下一步" placement="bottom" effect="light">
								<el-button class="!pr-1 !pl-0" type="plain" text @click="redo">
									<el-icon size="24" :color="haveRedo ? '#000' : '#ccc'"
										><RefreshRight
									/></el-icon>
								</el-button>
							</el-tooltip>
						</div>
					</div>
					<div class="w-80 flex flex-col p-2 bg-[#fff]/60">
						<div class="flex items-center text-[#121B27] my-3 mt-1">
							<div class="w-20">图名：</div>
							<el-input
								@change="changeImgName"
								v-model="imgName"
								placeholder=""
							/>
						</div>
						<div class="text-[#121B27] mb-2">专题图工具</div>
						<div class="flex justify-between items-center">
							<div
								class="flex flex-col items-center cursor-pointer text-[#8291A9]"
								v-for="item in toolList"
								:key="item.type"
								@click="changeActiveTool(item)"
							>
								<img
									:src="item.type === activeTool ? item.activeImg : item.img"
								/>
								<span
									:class="{ 'text-[#121B27]/80': item.type === activeTool }"
									>{{ item.label }}</span
								>
							</div>
						</div>
						<div class="flex items-center text-[#121B27]/80 mt-3">
							<div class="w-20">图片：</div>
							<div class="flex items-center mr-2">
								<span class="mr-1.5">宽</span>
								<el-input
									@change="changeStats('imgSize')"
									v-model.number="imgStats.imgWidth"
									placeholder=""
								/>
								<span class="mr-1.5 ml-2">高</span>
								<el-input
									@change="changeStats('imgSize')"
									v-model.number="imgStats.imgHeight"
									placeholder=""
								/>
							</div>
						</div>
						<div class="flex items-center text-[#121B27]/80 mt-3">
							<div class="w-20">图廓：</div>
							<div class="flex items-center mr-2">
								<span class="mr-1.5">宽</span>
								<el-input
									@change="changeStats('bgSize')"
									v-model.number="imgStats.borderWidth"
									placeholder=""
								/>
								<span class="mr-1.5 ml-2">高</span>
								<el-input
									@change="changeStats('bgSize')"
									v-model.number="imgStats.borderHeight"
									placeholder=""
								/>
							</div>
						</div>
						<div class="flex items-center text-[#121B27]/80 mt-3">
							<div class="w-20">底色：</div>
							<div class="flex items-center mr-2">
								<el-color-picker
									@change="changeStats('color')"
									v-model="imgStats.bgColor"
								/>
								<span class="ml-3">{{ imgStats.bgColor }}</span>
							</div>
						</div>
						<Text
							@change-family="changeFamily"
							@change-size="changeSize"
							@change-color="changeColor"
							@add="addText"
							:activeObject="activeText"
						></Text>
						<div class="flex items-center text-[#121B27]/80 mt-3">
							<div class="w-20">指北针：</div>
							<div class="flex items-center mr-2">
								<el-checkbox
									v-model="compassFlag"
									label=""
									@change="changeCompass"
								/>
							</div>
						</div>
						<div class="flex items-center text-[#121B27]/80 mt-3">
							<div class="w-20">经纬线：</div>
							<div class="flex items-center mr-2">
								<el-checkbox
									v-model="latlonFlag"
									label=""
									@change="changeLatlon"
								/>
							</div>
						</div>
						<div class="flex items-center text-[#121B27]/80 mt-3">
							<div class="w-20">比例尺：</div>
							<div class="flex items-center mr-2">
								<el-checkbox
									v-model="scaleFlag"
									label=""
									@change="changeScale"
								/>
							</div>
						</div>
						<div class="flex items-center text-[#121B27]/80 mt-3">
							<div class="w-20">图例：</div>
							<div class="flex items-center mr-2">
								<el-checkbox
									v-model="legendFlag"
									label=""
									@change="changeLegend"
								/>
							</div>
						</div>
						<div class="flex items-center text-[#121B27]/80 mt-3 relative">
							<div class="w-20">表格：</div>
							<div class="flex items-center mr-2">
								<el-checkbox v-model="tableFlag" />
							</div>
							<Table
								ref="tableImageRef"
								v-show="tableFlag"
								@save="addTable"
								@cancle="cancleTable"
							></Table>
						</div>
						<el-scrollbar height="200px">
							<Draw
								v-if="
									activeTool === ToolType.draw ||
									(activeEditorObject && activeEditorObject.type === 'path')
								"
								:activeObject="activeEditorObject"
								@change="changeActiveOption"
							></Draw>
							<Point
								v-if="
									activeTool === ToolType.point ||
									(activeEditorObject && activeEditorObject.type === 'f-point')
								"
								:activeObject="activeEditorObject"
								@change="changeActiveOption"
							></Point>
							<Polyline
								v-if="
									activeTool === ToolType.line ||
									(activeEditorObject && activeEditorObject.type === 'polyline')
								"
								:activeObject="activeEditorObject"
								@change="changeActiveOption"
							></Polyline>
							<Circle
								v-if="
									activeTool === ToolType.circle ||
									(activeEditorObject && activeEditorObject.type === 'circle')
								"
								:activeObject="activeEditorObject"
								@change="changeActiveOption"
							></Circle>
							<Rect
								v-if="
									activeTool === ToolType.rect ||
									(activeEditorObject && activeEditorObject.type === 'rect')
								"
								:activeObject="activeEditorObject"
								@change="changeActiveOption"
							></Rect>
						</el-scrollbar>
					</div>
				</div>
				<div class="flex -mt-10">
					<div class="mr-2.5">
						<span class="text-[#121B27] mr-[12px]">输出格式</span>
						<el-select
							v-model="picType"
							popper-class="dm-select"
							style="width: 120px"
							placeholder="请选择格式"
							clearable
						>
							<el-option
								v-for="item in typeList"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</div>
					<el-button type="primary" class="!text-[#fff]" @click="preview"
						><el-icon class="mr-2"><View /></el-icon>预览</el-button
					>
				</div>
			</div>
		</template>
		<template #footer>
			<div class="min-h-14 flex items-center justify-center">
				<el-button :style="{ width: '90px' }" @click="checkFlowCancle()"
					>取消</el-button
				>
				<el-button
					:style="{ width: '90px' }"
					type="primary"
					@click="checkFlowSubmit()"
					>保存</el-button
				>
				<el-button :style="{ width: '90px' }" type="primary" @click="loadJson()"
					>加载</el-button
				>
			</div>
		</template>
	</VDialog>
	<ElImageViewer
		v-if="previewList.length"
		hide-on-click-modal
		@close="closeViewer"
		:url-list="previewList"
	></ElImageViewer>
</template>

<script setup lang="ts">
import {
	nextTick,
	onMounted,
	onUnmounted,
	ref,
	shallowRef,
	toRefs,
	watch,
} from 'vue'
// import { fabric } from 'fabric'
import { ElImageViewer, ElMessage, ElMessageBox } from 'element-plus'
import {
	View,
	RefreshLeft,
	RefreshRight,
	Pointer,
	Rank,
} from '@element-plus/icons-vue'
import VDialog from '@/components/views/VDialog/index.vue'
import Text from './components/text.vue'
import Draw from './components/draw.vue'
import Point from './components/point.vue'
import Polyline from './components/polyline.vue'
import Circle from './components/circle.vue'
import Rect from './components/rect.vue'
import Table from './components/table.vue'
import ImgList from './components/imgList.vue'
import { TempLegend, ToolType, toolList, imgList } from './config'
import compassImg from '@/assets/images/mapProduct/compass.png'
import {
	fabric,
	Editor,
	FabricEditor,
	FabricUtils,
	FabricIcons,
} from '@s/fabric-editor'

// const props = withDefaults(defineProps<{}>(), {})
// const {} = toRefs(props)
const imageListRef = ref<any>([])
// 输出类型
const picType = ref('jpg')
const typeList = [
	{
		label: 'JPG',
		value: 'jpg',
	},
	{
		label: 'GIF',
		value: 'gif',
	},
	{
		label: 'SHP',
		value: 'shp',
	},
]
const previewList = ref<string[]>([])
/**
 * @Date: 2024-04-29 12:14:03
 * @Description: 预览
 * @return {*}
 */
const preview = () => {
	const png = editor.export2Img({ format: 'png' })
	previewList.value = [png]
	// downloadFile(png, 'png', 'test')
}
/**
 * @Date: 2024-04-30 17:31:07
 * @Description: 关闭预览
 * @return {*}
 */
const closeViewer = () => {
	previewList.value = []
}

// 对话框
const vDialogRef = ref()
const checkFlowCancle = () => {
	removeEditor()
	vDialogRef.value.close()
}
const checkFlowSubmit = () => {
	removeEditor()
	vDialogRef.value.close()
}
const checkCancle = () => {
	tableImageRef.value.reset()
	removeEditor()
}
const show = (data: any) => {
	vDialogRef.value.show()
	loadEditor()
}
onUnmounted(() => {
	removeEditor()
})
defineExpose({
	show,
})

// ------切换图片start------
const lastImageIndex = ref(0)
const nowImageIndex = ref(0)
const imageList = ref<any>(imgList)
const changeActiveImage = async (item: any, index: number) => {
	ElMessageBox.confirm('是否保存已修改的图片?', '注意', {
		confirmButtonText: '保存',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			const png = editor.export2Img({ format: 'png' })
			FabricUtils.downloadFile(png, 'png', 'test')
			imageList.value[lastImageIndex.value].url = png
			ElMessage({
				type: 'success',
				message: '已保存',
			})
		})
		.catch(() => {
			ElMessage({
				type: 'info',
				message: '已放弃保存',
			})
		})
		.finally(async () => {
			await removeEditor()
			await initEditor()
			await addImage(item.url)
			editor.canvas.requestRenderAll()
			lastImageIndex.value = nowImageIndex.value
			nowImageIndex.value = index
		})

	// activeImage.value.setSrc(item.url)
}

// ------图名start------
const imgName = ref('')
const changeImgName = () => {}
// ------图名end------

/**
 * @Date: 2024-04-30 10:01:09
 * @Description: editor选中事件
 * @return {*}
 */
const activeEditorObject = ref()
watch(
	() => activeEditorObject.value,
	(activeEditorObject) => {
		// console.log(activeEditorObject)
	}
)
const clickHandler = (opt: any) => {
	const { target } = opt
	if (editor.getIfPanEnable()) return

	if (!target || target.id === FabricUtils.SKETCH_ID) {
		activeEditorObject.value = undefined
		return
	}

	if (target.type === 'f-text') {
		editor.canvas.setActiveObject(target)
		activeText.value = target
	} else if (
		['path', 'circle', 'rect', 'image', 'f-point', 'polyline'].includes(
			target.type
		)
	) {
		editor.canvas.setActiveObject(target)
		activeEditorObject.value = target
	}

	if (opt.button === 3) {
		// 右键
		if (target.id !== FabricUtils.SKETCH_ID) {
			editor.canvas.setActiveObject(target)
		}
	}
}

const selectionHandler = (opt: any) => {
	const { selected, sketch } = opt
	if (selected && selected.length) {
		const selection = editor.canvas.getActiveObject()
		activeEditorObject.value = selection
	} else {
		// editor.canvas.setActiveObject(sketch)
		activeEditorObject.value = sketch
	}
}

const groupHandler = () => {
	const selection = editor.canvas.getActiveObject()
	activeEditorObject.value = selection
}

const initEvent = () => {
	// editor.canvas.on('selection:created', selectionHandler)
	// editor.canvas.on('selection:updated', selectionHandler)
	// editor.canvas.on('selection:cleared', selectionHandler)

	editor.canvas.on('mouse:down', clickHandler)
	editor.canvas.on('fabritor:group', groupHandler)
	editor.canvas.on('fabritor:ungroup', groupHandler)
	editor.canvas.on('after:render', handleRender)
}
/**
 * @Date: 2024-04-29 12:13:38
 * @Description: 初始化绘制
 * @return {*}
 */
const workspaceRef = ref()
const canvasRef = ref()
let editor: Editor
const initEditor = async () => {
	const workspace = document.getElementById('workspace')
	const canvas = document.getElementById('canvas')
	editor = new Editor({
		canvasEl: canvas,
		workspaceEl: workspace,
		template: {
			width: imgStats.value.borderWidth,
			height: imgStats.value.borderHeight,
		},
		sketchEventHandler: {
			groupHandler: () => {
				// setActiveObject(_editor.canvas.getActiveObject())
			},
		},
	})

	await editor.init()

	changeBgSize()

	initEvent()
}
/**
 * @Date: 2024-05-16 20:28:14
 * @Description: 清除画布
 * @return {*}
 */
const clearEditor = async () => {
	fontOptions.value = {
		text: '这里输入文本',
		fill: '#fff',
		fontFamily: '方正楷体',
		fontSize: 16,
	}
	brushOption.value = {
		color: '#fff',
		width: 1,
	}
	pointOption.value = {
		radius: 5,
		fill: 'rgba(255,0,0,1)',
	}
	lineOption.value = {
		stroke: 'rgba(255,0,0,1)',
		strokeWidth: 2,
	}
	circleOption.value = {
		fill: 'rgba(255,255,255,0)',
		stroke: 'rgba(255,255,255,1)',
		strokeWidth: 2,
	}
	rectOption.value = {
		fill: 'rgba(255,255,255,0)',
		stroke: 'rgba(255,255,255,1)',
		strokeWidth: 2,
	}

	panEnable.value = false
	compassFlag.value = false
	latlonFlag.value = false
	scaleFlag.value = false
	legendFlag.value = false
	tableFlag.value = false

	if (!editor) return
	await editor.clearCanvas()
	editor.fireCustomModifiedEvent()
}
/**
 * @Date: 2024-04-30 16:49:06
 * @Description: 删除画布
 * @return {*}
 */
const removeEditor = async () => {
	await clearEditor()
	editor.destroy()
}

const loadEditor = () => {
	nextTick(() => {
		initParams()
		initEditor()
		addImage(imageList.value[0].url)
	})
}

/**
 * @Date: 2024-05-17 09:50:50
 * @Description: 调整画布拖拽状态
 * @return {*}
 */
const panEnable = ref(false)
const changeEnable = (val: boolean) => {
	panEnable.value = val
	editor.setPanEnable(val)
}
/**
 * @Date: 2024-05-13 19:45:28
 * @Description: 获取历史状态
 * @return {*}
 */
const handleRender = () => {
	if (!editor) return
	haveUndo.value = editor.fhistory.canUndo()
	haveRedo.value = editor.fhistory.canRedo()
}
const haveUndo = ref(false)
/**
 * @Date: 2024-05-13 19:31:35
 * @Description: 上一步
 * @return {*}
 */
const undo = () => {
	if (editor && haveUndo.value) {
		editor.fhistory.undo()
	}
}
const haveRedo = ref(false)
/**
 * @Date: 2024-05-13 19:31:41
 * @Description: 下一步
 * @return {*}
 */
const redo = () => {
	if (editor && haveRedo.value) {
		editor.fhistory.redo()
	}
}

/**
 * @Date: 2024-04-29 12:14:29
 * @Description: 当前绘制工具
 * @return {*}
 */
const activeTool = ref<ToolType>()
const changeActiveTool = (item: any) => {
	editor.canvas.setActiveObject(editor.sketch)
	activeEditorObject.value = undefined

	if (activeTool.value === item.type) {
		activeTool.value = undefined
	} else {
		activeTool.value = item.type
	}
	// 关闭涂鸦
	stopFreeDrawMode()
	// 关闭点绘制
	closeDrawPoint()
	// 关闭折线绘制
	closePolyline()
	switch (activeTool.value) {
		case ToolType.draw:
			initBrush()
			break
		case ToolType.point:
			initPoint()
			break
		case ToolType.line:
			initPolyline()
			break
		case ToolType.circle:
			initCircle()
			break
		case ToolType.rect:
			initRect()
			break

		default:
			break
	}
}

/**
 * @Date: 2024-04-28 14:27:36
 * @Description: 初始化图片参数
 * @return {*}
 */
const initParams = () => {
	imgStats.value = {
		borderWidth: 800,
		borderHeight: 500,
		oldImgWidth: null,
		oldImgHeight: null,
		imgWidth: null,
		imgHeight: null,
		bgColor: '#fff',
	}
}

// 图片 start
/**
 * @Date: 2024-04-26 17:04:29
 * @Description: 当前操作图片
 * @return {*}
 */
const activeImage = shallowRef<any>()
/**
 * @Date: 2024-04-26 16:50:08
 * @Description: 添加图片，并默认居中
 * @param {*} url
 * @return {*}
 */
const addImage = async (url: string) => {
	activeImage.value = await FabricEditor.createFImage({
		imageSource: url,
		canvas: editor.canvas,
		lockMovementX: true,
		lockMovementY: true,
		hasControls: false,
	})
	imgStats.value = {
		...imgStats.value,
		imgWidth: activeImage.value.width,
		imgHeight: activeImage.value.height,
		oldImgWidth: activeImage.value.width,
		oldImgHeight: activeImage.value.height,
	}
	editor.canvas.requestRenderAll()
	editor.fireCustomModifiedEvent()
	imgStats.value.borderWidth = parseFloat(
		(imgStats.value.imgWidth! * 1.1).toFixed(2)
	)
	imgStats.value.borderHeight = parseFloat(
		(imgStats.value.imgHeight! * 1.1).toFixed(2)
	)
	changeBgSize()

	activeImage.value.on('mousedown', (e) => {
		console.log(e)
	})
}
/**
 * @Date: 2024-04-28 11:27:18
 * @Description: 置中
 * @param {*} object
 * @return {*}
 */
const setCenter = (object: any) => {
	editor.canvas.viewportCenterObject(object)
	object.setCoords()
}

/**
 * @Date: 2024-04-28 14:23:20
 * @Description: 图片参数
 * @return {*}
 */
const imgStats = ref({
	borderWidth: 800,
	borderHeight: 500,
	oldImgWidth: null,
	imgWidth: null,
	oldImgHeight: null,
	imgHeight: null,
	bgColor: '#fff',
})
/**
 * @Date: 2024-04-28 11:26:05
 * @Description: 调整图片大小
 * @return {*}
 */
const changeImgSize = () => {
	activeImage.value.scaleX =
		imgStats.value.imgWidth! / imgStats.value.oldImgWidth!
	activeImage.value.scaleY =
		imgStats.value.imgHeight! / imgStats.value.oldImgHeight!
	setCenter(activeImage.value)

	latlonline && latlonline.update()
	scaleRule && scaleRule.update()
	legendBox && legendBox.update()

	editor.canvas.requestRenderAll()
	editor.fireCustomModifiedEvent()
}
/**
 * @Date: 2024-04-28 11:26:14
 * @Description: 调整背景大小
 * @return {*}
 */
const changeBgSize = () => {
	editor.setSketchSize({
		width: imgStats.value.borderWidth,
		height: imgStats.value.borderHeight,
		fill: imgStats.value.bgColor,
	})
	activeImage.value && setCenter(activeImage.value)

	latlonline && latlonline.update()
	scaleRule && scaleRule.update()
	legendBox && legendBox.update()

	editor.fireCustomModifiedEvent()
}
/**
 * @Date: 2024-04-28 11:26:52
 * @Description: 调整背景颜色
 * @return {*}
 */
const changeBgColor = () => {
	const { sketch, canvas } = editor
	sketch.set('fill', imgStats.value.bgColor)
	canvas.requestRenderAll()

	editor.fireCustomModifiedEvent()
}
const changeStats = (val: 'imgSize' | 'bgSize' | 'color') => {
	switch (val) {
		case 'imgSize':
			changeImgSize()
			break
		case 'bgSize':
			changeBgSize()
			break
		case 'color':
			changeBgColor()
			break

		default:
			break
	}
}

// ------文字start------
const fontOptions = ref({
	text: '这里输入文本',
	fill: '#fff',
	fontFamily: '方正楷体',
	fontSize: 16,
})
let activeText = shallowRef<any>()
/**
 * @Date: 2024-04-28 14:24:21
 * @Description: 添加文字
 * @return {*}
 */
const addText = async () => {
	activeText.value = await FabricEditor.createTextbox({
		...fontOptions.value,
		canvas: editor.canvas,
		top: 20,
		left: 20,
	})

	activeText.value.on('mouse:down', (e) => {
		console.log(e)
	})
}
/**
 * @Date: 2024-04-28 14:22:32
 * @Description: 调整字体
 * @param {*} val
 * @return {*}
 */
const changeFamily = async (val: string) => {
	fontOptions.value.fontFamily = val
	try {
		await FabricUtils.loadFont(val)
	} finally {
		activeText.value.set('fontFamily', val)
	}
	editor.canvas.requestRenderAll()
}
/**
 * @Date: 2024-04-28 14:22:49
 * @Description: 调整文字大小
 * @param {*} val
 * @return {*}
 */
const changeSize = (val: number) => {
	fontOptions.value.fontSize = val
	activeText.value.set({
		fontSize: val,
	})
	editor.canvas.requestRenderAll()
}
/**
 * @Date: 2024-04-28 14:22:56
 * @Description: 调整文字颜色
 * @param {*} val
 * @return {*}
 */
const changeColor = (val: string) => {
	fontOptions.value.fill = val
	activeText.value.set({
		fill: val,
	})
	editor.canvas.requestRenderAll()
}

/**
 * @Date: 2024-04-30 14:41:41
 * @Description: 工具调整，针对绘制、标点、线段、圆圈和矩形
 * @param {*} option
 * @return {*}
 */
const changeActiveOption = (option: any) => {
	if (option.type === 'draw') {
		brushOption.value = {
			color: option.stroke,
			width: option.strokeWidth,
		}
		if (activeEditorObject.value && activeEditorObject.value.type === 'path') {
			activeEditorObject.value.set('stroke', option.stroke)
			activeEditorObject.value.set('strokeWidth', option.strokeWidth)
		}
		if (activeTool.value === ToolType.draw) {
			editor.canvas.freeDrawingBrush.color = option.stroke
			editor.canvas.freeDrawingBrush.width = option.strokeWidth
		}
	}
	if (option.type === 'point') {
		pointOption.value = {
			fill: option.fill,
			radius: option.radius,
		}

		if (
			activeEditorObject.value &&
			activeEditorObject.value.type === 'f-point'
		) {
			activeEditorObject.value.set('fill', option.fill)
			activeEditorObject.value.set('radius', option.radius)
		} else {
			gPoint && gPoint.setOptions(pointOption.value)
		}
	}
	if (option.type === 'line') {
		lineOption.value = {
			stroke: option.stroke,
			strokeWidth: option.strokeWidth,
		}

		if (
			activeEditorObject.value &&
			activeEditorObject.value.type === 'polyline'
		) {
			activeEditorObject.value.set('stroke', option.stroke)
			activeEditorObject.value.set('strokeWidth', option.strokeWidth)
		} else {
			gpolyline && gpolyline.setOptions(lineOption.value)
		}
	}
	if (option.type === 'circle') {
		circleOption.value = {
			fill: option.fill,
			stroke: option.stroke,
			strokeWidth: option.strokeWidth,
		}
		if (
			activeEditorObject.value &&
			activeEditorObject.value.type === 'circle'
		) {
			activeEditorObject.value.set('fill', option.fill)
			activeEditorObject.value.set('stroke', option.stroke)
			activeEditorObject.value.set('strokeWidth', option.strokeWidth)
		}
	}
	if (option.type === 'rect') {
		rectOption.value = {
			fill: option.fill,
			stroke: option.stroke,
			strokeWidth: option.strokeWidth,
		}
		if (activeEditorObject.value && activeEditorObject.value.type === 'rect') {
			activeEditorObject.value.set('fill', option.fill)
			activeEditorObject.value.set('stroke', option.stroke)
			activeEditorObject.value.set('strokeWidth', option.strokeWidth)
		}
	}

	editor.canvas.requestRenderAll()
}

// ------指北针start------
const compassFlag = ref(false)
const compassImage = shallowRef<any>()
/**
 * @Date: 2024-05-07 17:25:58
 * @Description: 添加指北针
 * @return {*}
 */
const addCompass = async () => {
	if (compassImage.value) {
		editor.canvas.setActiveObject(compassImage.value)
		activeEditorObject.value = compassImage.value
		return
	}
	compassImage.value = await FabricEditor.createImage({
		imageSource: compassImg,
		canvas: editor.canvas,
	})
	compassImage.value.set({
		left: activeImage.value.width - 32,
		top: 44,
		lockRatio: true,
	})
	editor.canvas.requestRenderAll()
	editor.fireCustomModifiedEvent()

	compassImage.value.on('mousedown', (e) => {
		console.log(e)
	})
}
/**
 * @Date: 2024-05-07 17:26:06
 * @Description: 指北针状态
 * @param {*} val
 * @return {*}
 */
const changeCompass = (val: boolean) => {
	if (val) {
		addCompass()
	} else {
		editor.canvas.remove(compassImage.value)
		compassImage.value = undefined
	}
}

// ------经纬线start------
const latlonFlag = ref(false)
let latlonline: FabricEditor.LatlonLine
/**
 * @Date: 2024-05-14 09:46:10
 * @Description: 添加经纬线
 * @return {*}
 */
const addLatlon = async () => {
	if (editor) {
		latlonline = new FabricEditor.LatlonLine(
			editor,
			editor.canvas,
			activeImage.value,
			{
				rect: {
					minLat: 20,
					maxLat: 60,
					minLon: 32,
					maxLon: 150,
				},
				// fraction: 3,
				// zoom: 4,
			}
		)

		latlonline.on('mousedown', (e) => {
			console.log(e)
		})
	}
}
/**
 * @Date: 2024-05-14 13:20:30
 * @Description: 移除经纬度
 * @return {*}
 */
const removeLatlon = () => {
	latlonline.remove()
}
/**
 * @Date: 2024-05-14 09:46:19
 * @Description: 切换经纬度
 * @param {*} val
 * @return {*}
 */
const changeLatlon = (val: boolean) => {
	if (val) {
		addLatlon()
	} else {
		removeLatlon()
	}
}

// ------比例尺start------
const scaleFlag = ref(false)
let scaleRule: FabricEditor.ScaleRule
/**
 * @Date: 2024-05-14 09:46:10
 * @Description: 添加比例尺
 * @return {*}
 */
const addScale = async () => {
	if (editor) {
		scaleRule = new FabricEditor.ScaleRule(
			editor,
			editor.canvas,
			activeImage.value,
			{
				rect: {
					minLat: 20,
					maxLat: 30,
					minLon: 110,
					maxLon: 130,
				},
				// 文字大小
				fontSize: 14,
				// 比例尺竖线长度
				short: 10,
				// 比例尺横线长度
				long: 100,
			}
		)
		scaleRule.on('rotating', (e) => {
			console.log(e)
		})
	}
}
/**
 * @Date: 2024-05-14 09:46:19
 * @Description: 指北针状态
 * @param {*} val
 * @return {*}
 */
const changeScale = (val: boolean) => {
	if (val) {
		addScale()
	} else {
		scaleRule.remove()
	}
}

// ------图例start------
const legendFlag = ref(false)
let legendBox: FabricEditor.LegendBox
/**
 * @Date: 2024-05-14 09:46:10
 * @Description: 添加图例
 * @return {*}
 */
const addLegendBox = async () => {
	if (editor) {
		legendBox = new FabricEditor.LegendBox(
			editor,
			editor.canvas,
			activeImage.value,
			{
				legend: {
					unit: '',
					list: [
						{
							value: 1,
							label: '一级风险',
							color: [24, 113, 228, 1],
						},
						{
							value: 2,
							label: '二级风险',
							color: [104, 236, 74, 1],
						},
						{
							value: 1,
							label: '三级风险',
							color: [235, 165, 43, 1],
						},
						{
							value: 1,
							label: '四级风险',
							color: [240, 52, 0, 1],
						},
					],
				},
				left: 150,
				top: 100,
			}
		)
		await legendBox.init()
		legendBox.on('mousedown', (e) => {
			console.log(e)
		})
	}
}
/**
 * @Date: 2024-05-14 09:46:19
 * @Description: 图例
 * @param {*} val
 * @return {*}
 */
const changeLegend = (val: boolean) => {
	if (val) {
		addLegendBox()
	} else {
		legendBox.remove()
	}
}

// ------表格start------
const tableFlag = ref(false)
const tableImage = shallowRef<any>()
const tableImageRef = ref()
/**
 * @Date: 2024-05-07 17:25:58
 * @Description: 添加表格
 * @return {*}
 */
const addTable = async (img: string) => {
	if (tableImage.value) {
		editor.canvas.setActiveObject(tableImage.value)
		activeEditorObject.value = tableImage.value
		tableImage.value.setSrc(img, () => {
			editor.canvas.requestRenderAll()
		})
		tableFlag.value = false
		return
	}

	tableImage.value = await FabricEditor.createImage({
		imageSource: img,
		canvas: editor.canvas,
	})
	tableImage.value!.set({
		right: 0,
		bottom: 0,
		lockRatio: true,
	})
	tableImage.value.on('removed', () => {
		tableImage.value = undefined
	})
	editor.canvas.requestRenderAll()
	editor.fireCustomModifiedEvent()

	tableFlag.value = false
}
/**
 * @Date: 2024-05-29 16:30:53
 * @Description: 关闭表格
 * @return {*}
 */
const cancleTable = () => {
	tableFlag.value = false
}

// ------绘制start------
const brushOption = ref({
	color: '#fff',
	width: 1,
})
/**
 * @Date: 2024-04-30 11:22:56
 * @Description: 初始化画笔
 * @return {*}
 */
const initBrush = () => {
	if (editor) {
		editor.canvas.isDrawingMode = true
		editor.canvas.freeDrawingCursor = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
			FabricIcons.DRAW_MODE_CURSOR
		)}") 4 12, crosshair`
		const freeDrawingBrush = new fabric.PencilBrush(editor.canvas)
		editor.canvas.freeDrawingBrush = freeDrawingBrush
		const { color, width } = brushOption.value
		freeDrawingBrush.color = color
		freeDrawingBrush.width = width
	}
}
/**
 * @Date: 2024-04-30 11:23:21
 * @Description: 停止绘制
 * @return {*}
 */
const stopFreeDrawMode = () => {
	editor.canvas.isDrawingMode = false
}

// ------线段start------
let gpolyline: FabricEditor.GPolyline | undefined
const lineOption = ref({
	stroke: 'rgba(255,0,0,1)',
	strokeWidth: 2,
})
const initPolyline = () => {
	if (editor) {
		const cb = () => {
			activeTool.value = undefined
			gpolyline = undefined
		}
		gpolyline = new FabricEditor.GPolyline(editor, editor.canvas, cb, {
			...lineOption.value,
		})
	}
}
const closePolyline = () => {
	gpolyline && gpolyline.remove()
}
// ------线段end------

// ------点start------
const pointOption = ref({
	radius: 5,
	fill: 'rgba(255,0,0,1)',
})
let gPoint: FabricEditor.GPoint
const initPoint = () => {
	if (editor) {
		gPoint = new FabricEditor.GPoint(editor, editor.canvas, {
			...pointOption.value,
		})
	}
}
/**
 * @Date: 2024-05-14 09:39:25
 * @Description: 关闭点绘制
 * @return {*}
 */
const closeDrawPoint = () => {
	gPoint && gPoint.remove()
}

// ------圆圈start------
const circleOption = ref({
	fill: 'rgba(255,255,255,0)',
	stroke: 'rgba(255,255,255,1)',
	strokeWidth: 2,
})
const initCircle = () => {
	if (editor) {
		FabricEditor.createShape(fabric.Circle, {
			radius: 100,
			...circleOption.value,
			canvas: editor.canvas,
		})
	}
}

// ------矩形start------
const rectOption = ref({
	fill: 'rgba(255,255,255,0)',
	stroke: 'rgba(255,255,255,1)',
	strokeWidth: 2,
})
const initRect = () => {
	if (editor) {
		FabricEditor.createShape(fabric.Rect, {
			width: 200,
			height: 200,
			...rectOption.value,
			canvas: editor.canvas,
		})
	}
}

const loadJson = () => {
	// editor.autoSave.loadFromJson(JSON.stringify(jsonStr))
}
</script>

<style lang="scss">
.check-flow-dialog {
	.el-tree {
		background: transparent !important;
	}

	.el-tree-node {
		&:focus > .el-tree-node__content {
			background-color: #ebeff3;
		}
		&.is-current > .el-tree-node__content {
			background-color: #ebeff3 !important;
		}
		background-color: transparent;
		.el-tree-node__content {
			height: auto;
			padding: 5px 0;
			align-items: flex-start;
			&:hover {
				background-color: #ebeff3;
			}
			.el-tree-node__label {
				white-space: break-spaces;
				margin-top: 3px;
			}
			.el-checkbox__input:not(.is-checked) {
				.el-checkbox__inner {
					border-color: #15abfc;
					background-color: transparent;
				}
			}
		}
	}
}

.editor-dialog {
	.el-dialog__body {
		height: calc(100% - 128px);
	}
}
</style>
