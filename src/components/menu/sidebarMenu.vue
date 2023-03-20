<template>
  <template v-for="(menuItem, menuIndex) in menuList" :key="menuIndex">
    <el-sub-menu :index="menuItem.path" v-if="menuItem.children && menuItem.children.length">
      <template #title>
        <el-icon>
          <component :is="menuItem.icon"></component>
        </el-icon>
        <span>{{ menuItem.name }}</span>
      </template>
      <sidebar-menu :menuList="menuItem.children"></sidebar-menu>
    </el-sub-menu>
    <el-menu-item :index="menuItem.path" v-else>
      <span>{{ menuItem.name }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { MenuItemType } from '@/types/menu'

type Props = {
  menuList: MenuItemType[]
}
const props = withDefaults(defineProps<Props>(), {
  menuList: () => [{
    path: '/',
    id: '0',
    flag: false,
    name: '菜单一',
    type: 'none',
    icon: ''
  }]
})

</script>

<style lang="scss" scoped>

</style>