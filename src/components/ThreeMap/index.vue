<!--
 * @Author: wanglx
 * @Date: 2025-11-11 11:33:40
 * @LastEditors: @zhangl
 * @LastEditTime: 2026-03-11 15:41:44
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
-->
<template>
	<div class="absolute left-0 right-0 top-0 bottom-0 z-[1]" v-loading="loading">
		<canvas ref="canvasMapRef" id="canvasMap"></canvas>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue'
import { World } from './map'
import { Assets } from './assets'
const loading = ref(true)
const props = withDefaults(
	defineProps<{
		map?: World
	}>(),
	{},
)

const smap = shallowRef<World | null>(null)

const canvasMapRef = shallowRef<HTMLCanvasElement | null>(null)

const assets = shallowRef<any>(null)

const emit = defineEmits<{
	(evt: 'update:map', map: World): void
	(evt: 'map-loaded'): void
}>()

onMounted(() => {
	initAssets(async () => {
		// 加载完成资源开始加载地图
		loading.value = false
		smap.value = new World(
			canvasMapRef.value as HTMLCanvasElement,
			assets.value,
		)
		setTimeout(() => {
			if (smap.value) {
				smap.value.time.resume()
				smap.value.animateTl.timeScale(1) // 设置播放速度正常
				smap.value.animateTl.play()

				// 监听动画完成事件
				smap.value.animateTl.eventCallback('onComplete', () => {
					emit('map-loaded')
				})

				smap.value.gridLayerModule.createGridLayer()
			}
		}, 100)
	})
})

const initAssets = (onLoadCallback?: () => void) => {
	assets.value = new Assets()
	// 资源加载进度
	let params = {
		progress: 0,
	}
	assets.value.instance.on(
		'onProgress',
		(path: any, itemsLoaded: any, itemsTotal: any) => {
			let p = Math.floor((itemsLoaded / itemsTotal) * 100)
			// console.log('[ p ] >', p)
		},
	)
	// 资源加载完成
	assets.value.instance.on('onLoad', () => {
		onLoadCallback && onLoadCallback()
	})
}

/**
 * @Date: 2023-09-12 16:46:26
 * @Description: 地图加载完成
 * @return {*}
 */
watch(smap, (smap) => {
	if (!smap) return
	emit('update:map', smap)
})
</script>

<style scoped lang="scss"></style>

<style lang="scss">
.china-label {
	color: #fff;

	font-size: 12px;
	will-change: transform;
	.other-label {
		font-size: 8px;
		display: flex;
		align-items: center;
		padding: 5px;
		border-radius: 4px;
		will-change: transform;
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	}

	&.blur {
		filter: blur(2px);
		opacity: 0.5;
	}
	.label-icon {
		display: block;
		width: 10px;
		height: 10px;
		margin: 0 10px 0 0;
	}
}

.other-label {
	transform: translateY(200%);
	opacity: 0;
	background: none;
	will-change: transform;
}
</style>
