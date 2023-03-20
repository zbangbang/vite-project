export type MenuItemType = {
  path: string
  id: string
  flag: boolean
  name: string
  type: string
  icon: string
  children?: MenuItemType[]
}