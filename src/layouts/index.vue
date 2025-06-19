<template>
	<div class="main">
		<Menu></Menu>
		<div class="container">
			<Header ref="header" :title="'头部区域'"></Header>
			<Content class="h-[calc(100%-150px)]"></Content>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Menu from '@/layouts/Menu/index.vue'
import Header from '@/layouts/Header/index.vue'
import Content from '@/layouts/Content/index.vue'

const header = ref<InstanceType<typeof Header>>()
onMounted(() => {
	header.value?.send(123)
})
</script>

<style lang="scss" scoped>
.main {
	width: 100vw;
	height: 100vh;
	display: flex;

	.container {
		flex: 1;
		display: flex;
		flex-flow: column nowrap;
	}
}
</style>
