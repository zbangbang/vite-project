<template>
	<el-row class="menu-row">
		<el-col :span="24">
			<!--      <div class="title">-->
			<!--        测试-->
			<!--      </div>-->
			<el-menu
				:default-active="activePath"
				class="menu-bar"
				router
				unique-opened
				@open="handleOpen"
				@close="handleClose"
			>
				<sidebar-menu :menuList="menuList"></sidebar-menu>
			</el-menu>
		</el-col>
	</el-row>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import {
	Document,
	Menu as IconMenu,
	Location,
	Setting,
} from '@element-plus/icons-vue'
import { useMenuStore } from '@/store/index'
import { storeToRefs } from 'pinia'
import SidebarMenu from '@/components/menu/sidebarMenu.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const useMenu = useMenuStore()
const { menuList } = storeToRefs(useMenu)
onMounted(() => {
	useMenu.initMenuList()
})

const handleOpen = () => {
	console.log('open')
}
const handleClose = () => {
	console.log('close')
}

const activePath = ref('')
watch(
	() => route.path,
	(path) => {
		activePath.value = path
	}
)
</script>

<style lang="scss" scoped>
.menu-row {
	width: 300px;
	padding: 10px;
	//border: 1px solid #ccc;

	.menu-bar {
		height: 100%;
	}
}
</style>
