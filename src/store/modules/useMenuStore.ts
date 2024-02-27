import { defineStore } from 'pinia'
import { MenuItemType } from '@/types/menu'
import { IMenuItem, menuList } from '@/layouts/Menu/config'


const useMenuStore = defineStore('menu', {
  state: () => {
    return {
      menuList: [] as MenuItemType[]
    }
  },
  actions: {
    /**
     * @Date: 2023-12-18 18:09:24
     * @Description: 递归处理菜单
     * @param {IMenuItem} list
     * @param {MenuItemType} arr
     * @param {string} level
     * @param {string} prev
     * @return {*}
     */
    handleTreeList(list: IMenuItem[], arr: MenuItemType[], level: string, prev: string) {
      let numArr = level.split(',')
      list.forEach((item, index) => {
        let i = index + 1
        if (item.children && item.children.length) {
          let arrItem: MenuItemType = {
            path: `${prev}\/${item.name}`,
            id: numArr.join('-') + String(i),
            flag: false,
            name: item.name,
            type: item.name,
            icon: item.icon,
            children: []
          }
          arr.push(arrItem)
          this.handleTreeList(item.children, arrItem.children!, numArr.join('-') + String(i), `${prev}\/${item.name}`)
        } else {
          arr.push({
            path: `${prev}\/${item.name}`,
            id: numArr.join('-') + String(i),
            flag: false,
            name: item.name,
            type: item.name,
            icon: item.icon,
            children: undefined
          })
        }
      })
    },
    initMenuList() {
      this.handleTreeList(menuList, this.menuList, '1', '')
    },
    setMenuList() {
      this.menuList = []
    }
  }
})

export default useMenuStore
