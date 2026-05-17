import { Mesh } from 'three'
import { Terrain } from '@/utils/three3d/components/Terrain'

/**
 * 地形模块 - 负责创建和管理 DEM 地形效果
 */
export class TerrainModule {
  private world: any
  public terrain!: Terrain
  public terrainMesh!: Mesh | null
  private terrainBounds: any = null // 地形边界信息
  private terrainOffset: any = null // 地形位置偏移
  private terrainSize: any = null // 地形实际尺寸 { width, height }

  constructor(world: any) {
    this.world = world
  }

  /**
   * 创建地形效果
   */
  async createTerrain() {
    try {
      // 加载高度图配置
      const configData = this.world.assets.instance.getResource('heightmapConfig')
      const config = JSON.parse(configData)

      console.log('地形配置:', config)

      // 计算合肥地图的实际投影尺寸
      const bounds = config.bounds
      const topLeft = this.world.geoProjection([bounds.west, bounds.north])
      const topRight = this.world.geoProjection([bounds.east, bounds.north])
      const bottomLeft = this.world.geoProjection([bounds.west, bounds.south])
      const bottomRight = this.world.geoProjection([bounds.east, bounds.south])

      // 计算实际宽高
      const mapWidth = Math.abs(topRight[0] - topLeft[0])
      const mapHeight = Math.abs(bottomLeft[1] - topLeft[1])

      // 保存地形尺寸信息
      this.terrainSize = {
        width: mapWidth,
        height: mapHeight
      }

      // 保存地形边界信息（用于边界线高度计算）
      this.terrainBounds = {
        minX: Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
        maxX: Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
        minY: Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]),
        maxY: Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1])
      }

      // 使用计算出的实际尺寸创建地形
      this.terrain = new Terrain(
        mapWidth, // 使用实际投影宽度
        mapHeight, // 使用实际投影高度
        512, // 分段数 - 平衡性能和细节
        1 // 高度缩放 - 增大以显示明显的地形起伏 (579m * 0.08 ≈ 46 单位)
      )

      // 从高度图创建地形（不自动旋转，跟随 focusMapGroup 的旋转）
      const heightmapUrl = this.world.assets.instance.getResource('heightmap').image.src
      this.terrainMesh = await this.terrain.createFromHeightmap(
        heightmapUrl,
        config,
        false // 不自动旋转
      )

      if (!this.terrainMesh) {
        throw new Error('地形网格创建失败')
      }

      // 设置地形位置 - 放在合肥地图顶面之上，保持在原点
      this.terrainMesh.position.set(
        0.1, // X 轴保持在原点
        -0.8, // Y 轴稍微向下移动，使地形与地图更好对齐
        this.world.depth + 0.25 // 在地图顶面之上
      )

      // 保存地形偏移信息
      // 注意：Y轴偏移需要双倍补偿，因为地图旋转导致坐标系变换
      this.terrainOffset = {
        x: 0.1,
        y: -0.8 * 2 // 旋转后需要双倍补偿：-1.6
      }

      // 更新地形材质，使用 Shader 内置的高度渐变颜色
      this.terrain.updateMaterial({
        displacementScale: 0.3 // 高度缩放，显示明显的地形起伏
      })

      return this.terrainMesh
    } catch (error) {
      console.error('地形加载失败:', error)
      return null
    }
  }

  /**
   * 获取地形边界信息
   */
  getTerrainBounds() {
    return this.terrainBounds
  }

  /**
   * 获取地形偏移信息
   */
  getTerrainOffset() {
    return this.terrainOffset
  }

  /**
   * 获取地形尺寸信息
   */
  getTerrainSize() {
    return this.terrainSize
  }

  /**
   * 销毁地形资源
   */
  dispose() {
    if (this.terrain) {
      this.terrain.dispose()
    }
  }
}
