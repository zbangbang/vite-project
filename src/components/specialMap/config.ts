/*
 * @FilePath: config.ts
 * @Author: @zhangl
 * @Date: 2024-03-08 16:41:00
 * @LastEditTime: 2024-05-16 18:40:10
 * @LastEditors: @zhangl
 * @Description:
 */

import dayjs from "dayjs"
import testImg from '@/assets/images/mapProduct/test.png'
import testImg1 from '@/assets/images/mapProduct/test1.png'
import testImg2 from '@/assets/images/mapProduct/test2.png'

export enum ToolType {
  draw,
  point,
  line,
  circle,
  rect
}
/**
 * @Date: 2024-03-08 16:43:23
 * @Description: 绘制工具
 * @return {*}
 */
export const toolList = [
  {
    label: '绘制',
    type: ToolType.draw,
    img: new URL(`@/assets/images/mapProduct/draw.png`, import.meta.url).href,
    activeImg: new URL(`@/assets/images/mapProduct/drawActive.png`, import.meta.url).href
  },
  {
    label: '标点',
    type: ToolType.point,
    img: new URL(`@/assets/images/mapProduct/point.png`, import.meta.url).href,
    activeImg: new URL(`@/assets/images/mapProduct/pointActive.png`, import.meta.url).href
  },
  {
    label: '线段',
    type: ToolType.line,
    img: new URL(`@/assets/images/mapProduct/line.png`, import.meta.url).href,
    activeImg: new URL(`@/assets/images/mapProduct/lineActive.png`, import.meta.url).href
  },
  {
    label: '圆圈',
    type: ToolType.circle,
    img: new URL(`@/assets/images/mapProduct/circle.png`, import.meta.url).href,
    activeImg: new URL(`@/assets/images/mapProduct/circleActive.png`, import.meta.url).href
  },
  {
    label: '矩形',
    type: ToolType.rect,
    img: new URL(`@/assets/images/mapProduct/rect.png`, import.meta.url).href,
    activeImg: new URL(`@/assets/images/mapProduct/rectActive.png`, import.meta.url).href
  }
]

export const FontFamilyArray = ['方正楷体', 'SmileySans', 'SourceHanSans', 'AlibabaPuHuiTi', '霞鹜新晰黑']
export const FontSizeList = [{
  value: 12,
  label: '12px'
}, {
  value: 14,
  label: '14px'
}, {
  value: 16,
  label: '16px'
}, {
  value: 18,
  label: '18px'
}, {
  value: 20,
  label: '20px'
}, {
  value: 24,
  label: '24px'
}, {
  value: 36,
  label: '36px'
}, {
  value: 48,
  label: '48px'
}]


export interface ILegendData {
  value: number,
  color: [number, number, number, number?],
  label?: string
}

export const TempLegend: {
  unit: string
  list: ILegendData[]
} = {
  unit: 'dbz',
  list: [{
    value: 5,
    color: [0, 0, 0, 0]
  }, {
    value: 10,
    color: [1, 160, 246, 1]
  }, {
    value: 15,
    color: [7, 235, 236, 1]
  }, {
    value: 20,
    color: [109, 250, 61, 1]
  }, {
    value: 25,
    color: [0, 216, 6, 1]
  }, {
    value: 30,
    color: [1, 144, 0, 1]
  }, {
    value: 35,
    color: [255, 255, 0, 1]
  }, {
    value: 40,
    color: [231, 191, 0, 1]
  }, {
    value: 45,
    color: [255, 144, 0, 1]
  }, {
    value: 50,
    color: [255, 0, 0, 1]
  }, {
    value: 55,
    color: [214, 0, 1, 1]
  }, {
    value: 60,
    color: [192, 0, 0, 1]
  }, {
    value: 65,
    color: [255, 0, 239, 1]
  }, {
    value: 70,
    color: [150, 1, 180, 1]
  }]
}

export const imgList = [
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg1
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg2
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg1
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg2
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg1
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg2
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg1
  },
  {
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    url: testImg2
  }
]
