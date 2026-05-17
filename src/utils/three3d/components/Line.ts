import {
  LineBasicMaterial,
  Mesh,
  Group,
  LineLoop,
  Vector3,
  BufferGeometry,
  CatmullRomCurve3,
  TubeGeometry
} from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
// import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { transfromMapGeoJSON, getBoundBox } from '../utils/utils'
import { geoMercator } from 'd3-geo'

export class Line {
  config: any
  lineGroup: Group

  /**
   *
   * @param {*} base this
   * @param {*} config
   */
  constructor({}: any, config: any = {}) {
    this.config = Object.assign(
      {
        visibelProvince: '',
        geoProjectionCenter: [0, 0],
        geoProjectionScale: 120,
        position: new Vector3(0, 0, 0),
        data: '',
        material: new LineBasicMaterial({ color: 0xffffff }),
        type: 'LineLoop',
        renderOrder: 1,
        tubeRadius: 0.2,
        terrain: null, // 地形对象，用于获取高度数据
        terrainBounds: null, // 地形边界，用于坐标转换
        terrainOffset: null, // 地形位置偏移 { x, y }
        heightScale: 0.3, // 地形高度缩放系数
        baseHeight: 0 // 地形的基础Z位置
      },
      config
    )

    let mapData = transfromMapGeoJSON(this.config.data)
    let lineGroup = this.create(mapData)
    this.lineGroup = lineGroup

    this.lineGroup.position.copy(this.config.position)
  }
  geoProjection(args: any): any {
    return geoMercator()
      .center(this.config.geoProjectionCenter)
      .scale(this.config.geoProjectionScale)
      .translate([0, 0])(args)
  }

  create(data: any): Group {
    const { type, visibelProvince } = this.config
    let features = data.features
    let lineGroup = new Group()
    for (let i = 0; i < features.length; i++) {
      const element = features[i]
      let group = new Group()
      group.name = 'meshLineGroup' + i
      if (element.properties.name === visibelProvince) {
        continue
      }
      element.geometry.coordinates.forEach((coords: any) => {
        const points: any[] = []
        let line: any = null

        if (type === 'Line2') {
          // Line2 类型 - 使用地形高度
          coords[0].forEach((item: any, index: number) => {
            const [x, y] = this.geoProjection(item)
            const terrainHeight = this.hasTerrainData() ? this.getTerrainHeight(x, -y) : 0
            points.push(x, -y, terrainHeight)
          })
          line = this.createLine2(points)
        } else if (type === 'noHeightLine') {
          // noHeightLine 类型 - 固定高度,不使用地形
          coords[0].forEach((item: any, index: number) => {
            const [x, y] = this.geoProjection(item)
            points.push(new Vector3(x, -y, 0.25))
          })
          line = this.createLine3(points)
        } else if (type === 'Line3') {
          // Line3 类型 - 使用地形高度
          coords[0].forEach((item: any, index: number) => {
            const [x, y] = this.geoProjection(item)
            const terrainHeight = this.hasTerrainData() ? this.getTerrainHeight(x, -y) : 0
            points.push(new Vector3(x, -y, terrainHeight))
          })
          line = this.createLine3(points)
        } else {
          // LineLoop 类型(默认) - 使用地形高度或基础高度
          coords[0].forEach((item: any, index: number) => {
            const [x, y] = this.geoProjection(item)
            const terrainHeight = this.hasTerrainData()
              ? this.getTerrainHeight(x, -y)
              : this.config.baseHeight || 0
            points.push(new Vector3(x, -y, terrainHeight))
          })
          line = this.createLine(points)
        }
        // 将线条插入到组中
        if (line) {
          group.add(line)
        }
      })
      lineGroup.add(group)
    }
    return lineGroup
  }
  createLine3(points: Vector3[]): Mesh {
    const tubeRadius = this.config.tubeRadius
    const tubeSegments = 256 * 10
    const tubeRadialSegments = 4
    const closed = false

    const { material, renderOrder } = this.config

    const curve = new CatmullRomCurve3(points)
    const tubeGeometry = new TubeGeometry(
      curve,
      tubeSegments,
      tubeRadius,
      tubeRadialSegments,
      closed
    )
    const line = new Mesh(tubeGeometry, material)
    line.name = 'mapLine3'
    line.renderOrder = renderOrder
    return line
  }
  createLine2(points: number[]): Line2 {
    const { material, renderOrder } = this.config
    const geometry = new LineGeometry()
    geometry.setPositions(points)
    let line = new Line2(geometry, material)
    line.name = 'mapLine2'
    line.renderOrder = renderOrder
    line.computeLineDistances()
    return line
  }
  createLine(points: Vector3[]): LineLoop {
    const { material, renderOrder, type } = this.config
    const geometry = new BufferGeometry()
    geometry.setFromPoints(points)
    let line = new LineLoop(geometry, material)
    line.renderOrder = renderOrder
    line.name = 'mapLine'
    return line
  }

  setParent(parent: any): void {
    parent.add(this.lineGroup)
  }

  /**
   * 检查是否有地形数据
   */
  private hasTerrainData(): boolean {
    return !!(this.config.terrain && this.config.terrainBounds)
  }

  /**
   * 获取指定位置的地形高度
   * @param x 世界坐标 X（geoProjection 的 x）
   * @param y geoProjection 的 y，在 Three.js 中会变成 -z（因为地图旋转了-90度）
   * @returns 地形高度（Z坐标）
   */
  private getTerrainHeight(x: number, y: number, debug = false): number {
    const { terrain, terrainBounds, heightScale, terrainOffset, baseHeight } = this.config

    // 如果没有地形数据，返回基础高度（调用前应该先用 hasTerrainData 检查）
    if (!terrain || !terrainBounds) {
      return baseHeight || 0
    }

    // 考虑地形的位置偏移
    const offsetX = terrainOffset?.x || 0
    const offsetY = terrainOffset?.y || 0 // TerrainModule 中已设置为 -1.6

    // 调整后的坐标
    const adjustedX = x - offsetX
    const adjustedY = y - offsetY

    // 将世界坐标转换为地形纹理的归一化坐标 (0-1)
    const bounds = terrainBounds
    const normalizedX = (adjustedX - bounds.minX) / (bounds.maxX - bounds.minX)
    const normalizedZ = (adjustedY - bounds.minY) / (bounds.maxY - bounds.minY)

    // 边界检查 - 放宽边界，避免過严格的裁剪
    if (normalizedX < -0.1 || normalizedX > 1.1 || normalizedZ < -0.1 || normalizedZ > 1.1) {
      return baseHeight || 0
    }

    // 限制在 0-1 范围内
    const clampedX = Math.max(0, Math.min(1, normalizedX))
    const clampedZ = Math.max(0, Math.min(1, normalizedZ))

    // 从地形获取归一化高度 (0-1)
    const normalizedHeight = terrain.getHeightAt(clampedX, clampedZ)

    // 应用高度缩放 + 基础高度，返回实际高度
    const finalHeight = (baseHeight || 0) + normalizedHeight * heightScale

    return finalHeight
  }
}
