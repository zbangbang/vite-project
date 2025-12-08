import { loadImageArr } from '@/utils'
import { Feature, Geometry, GeoJsonProperties } from 'geojson'

export interface IMarkerOption {
  type: 'image' | 'text' | 'point'
  field: string
  value?: string
  url?: string
  color?: string
  size?: number
  anchor?: "center" | "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
  offset?: [number, number]
  opacity?: number
  overlap?: boolean

  layout?: any
  paint?: any
}

export interface IMarkerLayerOption {
  cluster?: boolean
  clusterRadius?: number
  clusterMaxZoom?: number
  clusterMinPoints?: number
  clusterProperties?: any
  overlap?: boolean
}

export default class MarkerLayer {
  private smap: any
  private id: string = 'marker'
  private data: any[]
  private jsonData: GeoJSON.Feature[] = []
  private options: IMarkerOption[]
  private layerOptions: IMarkerLayerOption
  private imageOptions: IMarkerOption[]
  private textOptions: IMarkerOption[]
  private pointOptions: IMarkerOption[]
  constructor(smap: any, data: { lat: any, lon: any, [key: string]: any }[], options: IMarkerOption[], layerOptions: IMarkerLayerOption) {
    this.smap = smap
    this.data = data
    this.options = options
    this.layerOptions = layerOptions
    this.imageOptions = options.filter((item) => item.type === 'image')
    this.textOptions = options.filter((item) => item.type === 'text')
    this.pointOptions = options.filter((item) => item.type === 'point')

    this.initImage()
    this.initData()
    this.initLayer()
  }

  private async initImage() {
    let imgs = this.imageOptions.map((item) => item.url!)
    const icons = await loadImageArr(imgs)!

    this.imageOptions.forEach((item, index) => {
      if (!this.smap.hasImage(`${item.value}-img`)) {
        this.smap.addImage(`${item.value}-img`, icons[index])
      }
    })
  }

  private initData() {
    const list: Feature<Geometry, GeoJsonProperties>[] = []
    let dIndex = -1, pIndex = -1
    this.data.forEach((item, index) => {
      dIndex = this.imageOptions.findIndex((it) => it.value === item[it.field])
      pIndex = this.pointOptions.findIndex((it) => it.value === item[it.field])
      let props = {
        ...item,
      }
      if (dIndex !== -1) {
        props.icon = `${item[this.imageOptions[dIndex].field]}-img`
        props = {
          ...props,
          ...this.imageOptions[dIndex],
          drawType: 'image',
        }

      }
      if (pIndex !== -1) {
        props = {
          ...props,
          ...this.pointOptions[pIndex],
          drawType: 'point',
        }
      }
      list.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(item.lon), Number(item.lat)],
        },
        properties: props,
      })
    })

    console.log(this.data)
    console.log(list)

    this.jsonData = list
  }

  private initLayer() {
    this.smap.addSource(`${this.id}-source`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.jsonData,
      },
      cluster: this.layerOptions?.cluster ?? false,
      clusterRadius: this.layerOptions?.clusterRadius ?? 50,
      clusterMaxZoom: this.layerOptions?.clusterMaxZoom ?? 15,
      clusterMinPoints: this.layerOptions?.clusterMinPoints ?? 2,
      clusterProperties: this.layerOptions?.clusterProperties ?? {}
    })

    this.smap.addLayer({
      id: `${this.id}-icon-layer`,
      type: 'symbol',
      source: `${this.id}-source`,
      layout: {
        'icon-image': ['get', 'icon'],
        'icon-size': ['coalesce', ['get', 'size'], 1],
        'icon-anchor': ['coalesce', ['get', 'anchor'], 'center'],
        'icon-offset': ['coalesce', ['get', 'offset'], [0, 0]],
        'icon-rotate': ['coalesce', ['get', 'rotate'], 0],
        'icon-allow-overlap': this.layerOptions?.overlap ?? true,
      },
      paint: {
        'icon-opacity': ['coalesce', ['get', 'opacity'], 1],
      },
      filter: ['==', ['get', 'drawType'], 'image']
    })
    this.smap.addLayer({
      id: `${this.id}-circle-layer`,
      type: 'circle',
      source: `${this.id}-source`,
      layout: {
        // 'text-field': ['get', 'name'],
        // 'text-size': 12,
      },
      paint: {
        'circle-color': ['coalesce', ['get', 'color'], '#fff'],
        'circle-radius': ['coalesce', ['get', 'size'], 4],
      },
      filter: ['==', ['get', 'drawType'], 'point']
    })
    this.textOptions.forEach((item) => {
      this.smap.addLayer({
        id: `${this.id}-${item.field}-text-layer`,
        type: 'symbol',
        source: `${this.id}-source`,
        layout: {
          'text-size': item?.size ?? 12,
          'text-anchor': item?.anchor ?? 'center',
          'text-offset': item?.offset ?? [0, 0],
          'text-allow-overlap': item?.overlap ?? this.layerOptions?.overlap ?? false,
          ...item.layout,
          'text-field': ['get', `${item.field}`],
        },
        paint: {
          'text-color': item?.color ?? '#000',
          'text-opacity': item?.opacity ?? 1,
          ...item.paint,
        },
      })
    })

    this.smap.on('click', (e) => {
      let textLayer = this.textOptions.map(
        (item) => `${this.id}-${item.field}-text-layer`
      )
      const features = this.smap.queryRenderedFeatures(e.point, {
        layers: [`${this.id}-icon-layer`, ...textLayer], // 指定你想要监听的图层名称数组
      })

      console.log(features);
      if (!features.length) {
        console.log('没有找到任何要素')
        return
      }
    })
  }

  /**
   * 更新数据
   * @remarks:
   * @param {object} data
   * @returns {*}
   */
  refresh(data: { lat: any, lon: any, [key: string]: any }[]) {
    this.data = data

    this.initData()

    let source = this.smap.getSource(`${this.id}-source`)
    if (!source) return
    source.setData({
      type: 'FeatureCollection',
      features: this.jsonData,
    })
  }
}
