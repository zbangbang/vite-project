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
			<span class="inline-block w-16">z</span>
			<el-slider
				v-model="zValue"
				:min="zRange[0]"
				:max="zRange[1]"
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
			<span class="inline-block w-16">rotatx</span>
			<el-slider
				v-model="rxValue"
				:min="rRange[0]"
				:max="rRange[1]"
				show-input
				size="small"
			/>
		</div>
		<div class="flex items-center">
			<span class="inline-block w-16">rotaty</span>
			<el-slider
				v-model="ryValue"
				:min="rRange[0]"
				:max="rRange[1]"
				show-input
				size="small"
			/>
		</div>
		<div class="flex items-center">
			<span class="inline-block w-16">rotatz</span>
			<el-slider
				v-model="rzValue"
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
		xRange?: number[]
		y?: number
		yRange?: number[]
		z?: number
		zRange?: number[]
		sx?: number
		sxRange?: number[]
		xStep?: number
		sy?: number
		syRange?: number[]
		yStep?: number
		rx?: number
		ry?: number
		rz?: number
		rRange?: number[]
	}>(),
	{
		x: 0,
		xRange: () => [0, 100],
		y: 0,
		yRange: () => [0, 100],
		z: 0,
		zRange: () => [0, 100],
		sx: 1,
		sxRange: () => [0, 5],
		xStep: 0.1,
		sy: 0,
		syRange: () => [0, 5],
		yStep: 0.1,
		rx: 0,
		ry: 0,
		rz: 0,
		rRange: () => [0, 360],
	}
)
const {
	x,
	xRange,
	y,
	yRange,
	z,
	zRange,
	rx,
	ry,
	rz,
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
	'update:z',
	'update:rx',
	'update:ry',
	'update:rz',
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
const zValue = computed({
	set(val) {
		emit('update:z', val)
	},
	get() {
		return z.value
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
const rxValue = computed({
	set(val) {
		emit('update:rx', val)
	},
	get() {
		return rx.value
	},
})
const ryValue = computed({
	set(val) {
		emit('update:ry', val)
	},
	get() {
		return ry.value
	},
})
const rzValue = computed({
	set(val) {
		emit('update:rz', val)
	},
	get() {
		return rz.value
	},
})
</script>

<style lang="scss" scoped></style>
