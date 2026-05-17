<template>
	<div class="gl_content">
		<ThreeMap></ThreeMap>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import ThreeMap from '@/components/ThreeMap/index.vue'
</script>

<style lang="scss" scoped>
.gl_content {
	flex: 1;
	border: 1px solid;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 10px;
}
</style>
