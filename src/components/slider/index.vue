<template>
	<div>
		<div class="flex items-center">
			<span class="inline-block w-16">x</span>
			<el-slider
				v-model="xValue"
				:min="xRange[0]"
				:max="xRange[1]"
				show-input
				size="small"
			/>
		</div>
		<div class="flex items-center">
			<span class="inline-block w-16">y</span>
			<el-slider
				v-model="yValue"
				:min="yRange[0]"
				:max="yRange[1]"
				show-input
				size="small"
			/>
		</div>
		<div class="flex items-center">
			<span class="inline-block w-16">scalex</span>
			<el-slider
				v-model="sxValue"
				:min="sxRange[0]"
				:max="sxRange[1]"
				:step="xStep"
				show-input
				size="small"
			/>
		</div>
		<div class="flex items-center">
			<span class="inline-block w-16">scaley</span>
			<el-slider
				v-model="syValue"
				:min="syRange[0]"
				:max="syRange[1]"
				:step="yStep"
				show-input
				size="small"
			/>
		</div>
		<div class="flex items-center">
			<span class="inline-block w-16">rotat</span>
			<el-slider
				v-model="rValue"
				:min="rRange[0]"
				:max="rRange[1]"
				show-input
				size="small"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

const props = withDefaults(
	defineProps<{
		x?: number
		xRange?: [number, number]
		y?: number
		yRange?: [number, number]
		sx?: number
		sxRange?: [number, number]
		xStep?: number
		sy?: number
		syRange?: [number, number]
		yStep?: number
		r?: number
		rRange?: [number, number]
	}>(),
	{
		x: 0,
		xRange: () => [0, 100],
		y: 0,
		yRange: () => [0, 100],
		sx: 1,
		sxRange: () => [0, 5],
		xStep: 0.1,
		sy: 0,
		syRange: () => [0, 5],
		yStep: 0.1,
		r: 0,
		rRange: () => [0, 360],
	}
)
const {
	x,
	xRange,
	y,
	yRange,
	r,
	rRange,
	sx,
	sxRange,
	sy,
	syRange,
	xStep,
	yStep,
} = toRefs(props)
const emit = defineEmits([
	'update:x',
	'update:y',
	'update:r',
	'update:sx',
	'update:sy',
])

const xValue = computed({
	set(val) {
		emit('update:x', val)
	},
	get() {
		return x.value
	},
})
const yValue = computed({
	set(val) {
		emit('update:y', val)
	},
	get() {
		return y.value
	},
})
const sxValue = computed({
	set(val) {
		emit('update:sx', val)
	},
	get() {
		return sx.value
	},
})
const syValue = computed({
	set(val) {
		emit('update:sy', val)
	},
	get() {
		return sy.value
	},
})
const rValue = computed({
	set(val) {
		emit('update:r', val)
	},
	get() {
		return r.value
	},
})
</script>

<style lang="scss" scoped></style>
