import liuliangImg from '@/assets/images/station/liuliang.png'
import shuizhiImg from '@/assets/images/station/shuizhi.png'
import shuiwenImg from '@/assets/images/station/shuiwen.png'
import { IMarkerOption } from './MarkerLayer'

export const markerOptions: IMarkerOption[] = [
  {
    type: "image",
    field: "stationType",
    value: 'liuliang',
    url: liuliangImg,
    size: 1,
    // anchor: 'center',
    // offset: [0,0]
    // opacity: 1
    // overlap: true
  },
  {
    type: "text",
    field: "station_name",
    overlap: false,
    offset: [0, 2],
    layout: {
    }
  },
  {
    type: "text",
    field: "station_id_c",
    overlap: false,
    color: '#fff',
    offset: [0, -2],
    layout: {
      'text-letter-spacing': 0.15,
    },
    paint: {
      'text-halo-width': 2,
      // 'text-halo-blur': 1,
      'text-halo-color': '#000',
    }
  },
  {
    type: "image",
    field: "stationType",
    value: 'water',
    url: shuizhiImg,
    size: 0.5,
    // anchor: 'center',
    // offset: [0,0]
    // opacity: 1
  },
  {
    type: "point",
    field: "stationType",
    value: 'test',
    color: '#f00',
    size: 6,
    // anchor: 'center',
    // offset: [0,0]
    // opacity: 1
    // overlap: true
  },
  {
    type: "point",
    field: "stationType",
    value: 'circle',
    color: '#0f0',
    size: 4,
    // anchor: 'center',
    // offset: [0,0]
    // opacity: 1
    // overlap: true
  },
]