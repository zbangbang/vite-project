<template>
	<div class="w-full h-full relative">
		<div id="MapContainer"></div>
		<div class="absolute top-10 right-5 left-12 flex flex-wrap">
			<div
				class="bg-yellow-100 px-3 py-2 mr-1 mb-1 cursor-pointer"
				:class="[item.flag ? 'text-[#79d9ff]' : '']"
				v-for="(item, index) in btnList"
				:key="index"
				@click="changeItem(item)"
			>
				{{ item.label }}
			</div>
		</div>
		<div class="absolute right-3 top-36 w-36 h-5">
			<el-slider v-model="extentValue" range :min="-50" :max="50" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import testImg from '@/assets/tex.png'
import useCesium from '@/hooks/cesium/useCesium'
import { BtnType, IBtn, btnTypeList, imgList } from './config'
import { SelfPrimitive } from '@/utils/cesium/selfPrimitive'
// import { SelfPrimitive } from '@/utils/cesium/selfPrimitive-rect'
const { viewer } = useCesium('MapContainer')

// 按钮切换
const btnList = ref(btnTypeList)
const changeItem = (btnItem: IBtn) => {
	btnItem.flag = !btnItem.flag
	switch (btnItem.value) {
		case BtnType.色斑图:
			loadLayer(btnItem)
			break
		case BtnType.导出图片:
			saveToImage()
			break
		default:
			break
	}
}

/**
 * @Date: 2024-01-03 15:07:06
 * @Description: 绘制色斑图
 * @param {*} btnItem
 * @return {*}
 */
const loadLayer = (btnItem: IBtn) => {
	if (btnItem.flag) {
		draw3DWind()

		// viewer.value.viewer.scene.primitives.add(new TexturePrimitive())
	} else {
		clear3DWind()
	}
}

let selfPrimitive: SelfPrimitive | null = null
/**
 * 绘制3D风场
 */
const draw3DWind = async () => {
	const options: any = {
		latCount: 45,
		lonCount: 90,
		maxValue: 42.25002441406252,
		minValue: -50.84996643066404,
		colorList: [
			[115, 70, 105, 255],
			[202, 172, 195, 255],
			[162, 70, 145, 255],
			[143, 89, 169, 255],
			[157, 219, 217, 255],
			[106, 191, 181, 255],
			[100, 166, 189, 255],
			[93, 133, 198, 255],
			[68, 125, 99, 255],
			[128, 147, 24, 255],
			[243, 183, 4, 255],
			[232, 83, 25, 255],
			[71, 14, 0, 255],
		],
		valueList: [
			-40.15, -25.15, -15.15, -8.15, -4.15, 0, 5, 9.85, 15, 20.85, 25, 29.85,
			46.85,
			// 0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.4,
		],
		imgList: [testImg, testImg, testImg],
		minLon: 100,
		maxLon: 160,
		minLat: -15,
		maxLat: 15,
		// minLon: -180,
		// maxLon: 180,
		// minLat: -85.051129,
		// maxLat: 85.051129,
	}

	if (selfPrimitive) {
		// selfPrimitive.setData(trueArr, options)
	} else {
		selfPrimitive = new SelfPrimitive(options)
		viewer.value!.scene.primitives.add(selfPrimitive)
	}
}
const extentValue = ref([-50, 50])
watch(
	() => extentValue.value,
	(extentValue) => {
		selfPrimitive?.setExtentV(extentValue[0], extentValue[1])
	}
)
/**
 * 清除3D风场
 */
const clear3DWind = () => {
	if (selfPrimitive && viewer.value?.scene.primitives.contains(selfPrimitive)) {
		viewer.value.scene.primitives.remove(selfPrimitive)
		selfPrimitive = null
	}
}

const saveToImage = () => {
	// // 不写会导出为黑图
	// _viewer.render();

	let canvas = viewer.value.scene.canvas
	let image = canvas.toDataURL('image/png')

	let link = document.createElement('a')
	// let blob = dataURLtoBlob(image);
	// let objurl = URL.createObjectURL(blob);
	link.download = 'scene.png'
	link.href = image
	link.click()
}
</script>

<style lang="scss" scoped></style>
