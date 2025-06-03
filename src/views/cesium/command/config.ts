/*
 * @FilePath: config.ts
 * @Author: Aouvv Wang
 * @Date: 2024-01-10 11:19:30
 * @LastEditors: @zhangl
 * @LastEditTime: 2024-08-25 16:18:08
 * @Description:
 */
import img1 from '@/assets/no3_2019/no3-1-0.png'
import img2 from '@/assets/no3_2019/no3-1-1.png'
import img3 from '@/assets/no3_2019/no3-1-2.png'
import img4 from '@/assets/no3_2019/no3-1-3.png'
import img5 from '@/assets/no3_2019/no3-1-4.png'
import img6 from '@/assets/no3_2019/no3-1-5.png'

export const imgList = [
  img1,
  img2,
  img3,
  img4,
  img5,
  img6
]
export enum BtnType {
  '色斑图',
  '二维主屏',
  '点',
  '线',
  '多边形',
  '矩形',
  '圆',
  '启用编辑',
  '关闭编辑',
  '清除编辑对象',
  '清除场景',
  '导出标绘',
  '导入标绘',
  '卷积QB',
  '钳击QB',
  '多箭头QB',
  '进攻方向QB',
  '战役突击方向QB',
  '控制线QB',
  '文本框',
  '扫描波',
  '扩散波',
  '测距离',
  '测面积',
  '测高度',
  '测方位角',
  '图片',
  '模型3D',
  '粒子3D',
  '球体3D',
  '雷达罩3D',
  '火特效3D',
  '标记点1',
  '标记点2',
  '标记点3',
  '二维视图',
  '三维视图',
  '联动视图',
  '文本',
  '底图切换',
  '经纬网',
  '导出图片'
}

export interface IBtn {
  label: string
  value: BtnType
  flag: boolean
}

export const btnTypeList: IBtn[] = [
  {
    label: '色斑图',
    value: BtnType.色斑图,
    flag: false
  },
  {
    label: '导出图片',
    value: BtnType.导出图片,
    flag: false
  },
]
