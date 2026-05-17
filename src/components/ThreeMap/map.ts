import { Fog, DirectionalLight, AmbientLight, PointLight, Color } from 'three'
import { Mini3d } from '@/utils/three3d'
import { geoMercator } from 'd3-geo'
import { InteractionManager } from 'three.interactive'

// 导入模块
import { MapModule } from './modules/MapModule'
import { TerrainModule } from './modules/TerrainModule'
import { LabelModule } from './modules/LabelModule'
import { VisualizationModule } from './modules/VisualizationModule'
import { DecorationModule } from './modules/DecorationModule'
import { EventModule } from './modules/EventModule'
import { RainModule } from './modules/RainModule'
import { CloudModule } from './modules/CloudModule'
import { SunModule } from './modules/SunModule'
import { LightningModule } from './modules/LightningModule'
import { GridLayerModule } from './modules/GridLayerModule'
import { AnimationModule } from './modules/AnimationModule'
import { areaLabelList } from './config'

/**
 * 地图世界主类
 * 负责整合各个功能模块，提供统一的接口
 */
export class World extends Mini3d {
  // 继承自Mini3d的属性
  declare scene: any
  declare camera: any
  declare renderer: any
  declare canvas: any
  declare time: any
  declare sizes: any

  // World类配置属性
  geoProjectionCenter: [number, number]
  geoProjectionScale: number
  flyLineCenter: [number, number]
  depth: number
  mapFocusLabelInfo: {
    name: string
    enName: string
    center: [number, number]
  }
  clicked: boolean
  interactionManager: any
  assets: any

  // 模块实例
  private mapModule: MapModule
  // private terrainModule: TerrainModule
  public labelModule: LabelModule
  private visualizationModule: VisualizationModule
  private decorationModule: DecorationModule
  public eventModule: EventModule
  private animationModule: AnimationModule

  public rainModule: RainModule // 公开降雨模块供外部调用
  public cloudModule: CloudModule // 公开云层模块供外部调用
  public sunModule: SunModule // 公开太阳光照模块供外部调用
  public lightningModule: LightningModule // 公开闪电模块供外部调用
  public gridLayerModule: GridLayerModule // 公开网格图层模块供外部调用

  // 飞线焦点组（暂时保留）
  flyLineFocusGroup: any

  // 暴露动画时间线，供外部使用
  animateTl: any

  constructor(canvas: HTMLCanvasElement, assets: any) {
    super(canvas)

    // 初始化配置
    this.geoProjectionCenter = [117.31382853124166, 31.8450888670871]
    this.geoProjectionScale = 400
    this.flyLineCenter = [117.32619878210255, 31.762028404995363]
    this.depth = 0.6
    this.mapFocusLabelInfo = {
      name: '合肥市',
      enName: 'HeFei Administrative Division',
      center: [117.38382853124166, 30.8]
    }
    this.clicked = false

    // 场景设置
    // this.scene.fog = new Fog(0x102736, 1, 50);
    this.scene.background = new Color(0x102736)

    // 相机设置
    this.camera.instance.position.set(-10, 10, 20)
    this.camera.instance.near = 1
    this.camera.instance.far = 10000
    this.camera.instance.updateProjectionMatrix()

    // 创建交互管理
    this.interactionManager = new InteractionManager(
      this.renderer.instance,
      this.camera.instance,
      this.canvas
    )

    this.assets = assets

    // 初始化各个模块
    this.mapModule = new MapModule(this)
    // this.terrainModule = new TerrainModule(this)
    this.labelModule = new LabelModule(this)
    this.visualizationModule = new VisualizationModule(this)
    this.decorationModule = new DecorationModule(this)
    this.eventModule = new EventModule(this)
    this.animationModule = new AnimationModule(this)

    this.rainModule = new RainModule(this)
    this.cloudModule = new CloudModule(this)
    this.sunModule = new SunModule(this)
    this.lightningModule = new LightningModule(this)
    this.gridLayerModule = new GridLayerModule(this)

    // 创建环境光
    this.initEnvironment()

    // 初始化场景
    this.init()
  }

  /**
   * 初始化环境光照
   */
  initEnvironment() {
    let sun = new AmbientLight(0xffffff, 5)
    this.scene.add(sun)

    let directionalLight = new DirectionalLight(0xffffff, 5)
    directionalLight.position.set(-30, 6, -8)
    directionalLight.castShadow = true
    directionalLight.shadow.radius = 20
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    this.scene.add(directionalLight)

    // this.createPointLight({
    //   color: '#1d5e5e',
    //   intensity: 800,
    //   distance: 10000,
    //   x: -9,
    //   y: 3,
    //   z: -3
    // })

    // this.createPointLight({
    //   color: '#1d5e5e',
    //   intensity: 200,
    //   distance: 10000,
    //   x: 0,
    //   y: 2,
    //   z: 5
    // })
  }

  /**
   * 创建点光源
   */
  createPointLight(pointParams: {
    color: string
    intensity: number
    distance: number
    x: number
    y: number
    z: number
  }) {
    const pointLight = new PointLight(0x1d5e5e, pointParams.intensity, pointParams.distance)
    pointLight.position.set(pointParams.x, pointParams.y, pointParams.z)
    this.scene.add(pointLight)
  }

  /**
   * 初始化场景
   */
  async init() {
    // 创建飞线焦点组（暂时保留）
    const { Group } = await import('three')
    this.flyLineFocusGroup = new Group()
    this.flyLineFocusGroup.visible = false
    this.flyLineFocusGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.flyLineFocusGroup)

    // 1. 创建装饰效果
    this.decorationModule.createOceanWorldBg() // 海洋世界背景（合肥浮在上面）
    this.decorationModule.createBottomBg()
    this.decorationModule.createChinaBlurLine()
    this.decorationModule.createGrid()
    this.decorationModule.createDiffuse()
    // this.decorationModule.createParticles();

    // 2. 创建标签
    this.labelModule.createLabel(areaLabelList)

    // 3. 创建地图
    this.mapModule.createMap()

    this.mapModule.createMapLineWithTerrain(null, null, null)

    // 4. 创建地形
    // const terrainMesh = await this.terrainModule.createTerrain()
    // if (terrainMesh) {
    //   this.mapModule.focusMapGroup.add(terrainMesh)

    //   // 创建带有地形高度的边界线
    //   const terrainBounds = this.terrainModule.getTerrainBounds()
    //   const terrainOffset = this.terrainModule.getTerrainOffset()

    //   if (terrainBounds && terrainOffset && this.terrainModule.terrain) {
    //     this.mapModule.createMapLineWithTerrain(
    //       this.terrainModule.terrain,
    //       terrainBounds,
    //       terrainOffset
    //     )
    //   } else {
    //     console.warn('地形数据不完整，无法创建边界线')
    //   }

    //   // 创建网格图层（使用地形高度图进行裁剪）
    //   const gridLayerMesh = await this.gridLayerModule.createGridLayer()
    //   if (gridLayerMesh) {
    //     this.mapModule.focusMapGroup.add(gridLayerMesh)
    //   }
    // }

    // 5. 创建可视化元素
    this.visualizationModule.createScatter([])
    this.visualizationModule.createInfoPoint(this.labelModule, this.interactionManager, [])

    // 6. 创建地图轮廓线
    const pathLine = this.decorationModule.createStroke()
    this.mapModule.focusMapGroup.add(pathLine.lineGroup)

    // 7. 创建交互事件
    this.eventModule.createEvent(
      this.mapModule.eventElement,
      this.mapModule.defaultMaterial,
      this.mapModule.defaultLightMaterial
    )

    // 8. 创建动画时间线
    this.animateTl = this.animationModule.createTimeline(
      this.mapModule.focusMapGroup,
      this.mapModule.focusMapTopMaterial,
      this.mapModule.focusMapSideMaterial,
      this.mapModule.mapLineMaterial,
      this.labelModule.otherLabel,
      this.visualizationModule.scatterGroup,
      this.visualizationModule.InfoPointGroup,
      () => this.visualizationModule.createInfoPointLabelLoop(),
      () => { }
    )
  }

  /**
   * 地理投影
   */
  geoProjection(args: [number, number]): [number, number] {
    return geoMercator()
      .center(this.geoProjectionCenter)
      .scale(this.geoProjectionScale)
      .translate([0, 0])(args) as [number, number]
  }

  /**
   * 更新方法
   */
  update(delta?: number) {
    if (delta) super.update(delta)
    this.interactionManager && this.interactionManager.update()
  }

  /**
   * 销毁资源
   */
  destroy() {
    super.destroy()
    this.labelModule.dispose()
    // this.terrainModule.dispose()
    this.visualizationModule.dispose()
    this.gridLayerModule.dispose()
  }
}
