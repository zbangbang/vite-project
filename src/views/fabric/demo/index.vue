<template>
	<div class="w-full h-full border">
		<el-button @click="open">打开专题图</el-button>
	</div>
	<SpecialMap ref="specialMapRef"></SpecialMap>
</template>

<script setup lang="ts">
import SpecialMap from '@/components/specialMap/index.vue'
import { onMounted, ref } from 'vue'
const specialMapRef = ref()
// onMounted(() => {
// 	specialMapRef.value.show()
// })
const open = () => {
	specialMapRef.value.show()
}
</script>

<style lang="scss" scoped></style>
