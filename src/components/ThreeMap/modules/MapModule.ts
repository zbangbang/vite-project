import {
  Group,
  MeshBasicMaterial,
  Color,
  Vector3,
  MeshLambertMaterial,
  LineBasicMaterial,
  DoubleSide,
  RepeatWrapping,
  MeshStandardMaterial
} from 'three'
import { ExtrudeMap, BaseMap, Line, GradientShader } from '@/utils/three3d'

/**
 * 地图模块 - 负责创建地图相关的几何体和材质
 */
export class MapModule {
  private world: any
  public focusMapGroup!: Group
  public focusMapTopMaterial: any
  public focusMapSideMaterial: any
  public mapLineMaterial: any
  public eventElement: any[] = []
  public defaultMaterial: any = null
  public defaultLightMaterial: any = null
  public mapLine: any = null // 保存边界线引用，以便后续更新

  constructor(world: any) {
    this.world = world
  }

  /**
   * 创建地图
   */
  createMap() {
    let mapGroup = new Group()
    let focusMapGroup = new Group()
    this.focusMapGroup = focusMapGroup

    let { china, chinaTopLine } = this.createChina()
    let { map, mapTop } = this.createProvince()

    china.setParent(mapGroup)
    chinaTopLine.setParent(mapGroup)

    map.setParent(focusMapGroup)
    mapTop.setParent(focusMapGroup)
    // 边界线将在地形创建后再创建

    focusMapGroup.position.set(0, 0, -0.01)
    focusMapGroup.scale.set(1, 1, 0)
    mapGroup.add(focusMapGroup)
    mapGroup.rotation.x = -Math.PI / 2
    mapGroup.position.set(0, 0.2, 0)
    this.world.scene.add(mapGroup)
  }

  /**
   * 创建中国地图
   */
  createChina() {
    let params = {
      chinaBgMaterialColor: '#152c47',
      lineColor: '#3f82cd'
    }
    let chinaData = this.world.assets.instance.getResource('china')
    let chinaBgMaterial = new MeshLambertMaterial({
      color: new Color(params.chinaBgMaterialColor),
      transparent: true,
      opacity: 1
    })

    let china = new BaseMap(this.world, {
      data: chinaData,
      geoProjectionCenter: this.world.geoProjectionCenter,
      geoProjectionScale: this.world.geoProjectionScale,
      merge: true,
      material: chinaBgMaterial,
      renderOrder: 2
    })

    let chinaTopLineMaterial = new LineBasicMaterial({
      color: params.lineColor
    })

    let chinaTopLine = new Line(this.world, {
      data: chinaData,
      geoProjectionCenter: this.world.geoProjectionCenter,
      geoProjectionScale: this.world.geoProjectionScale,
      material: chinaTopLineMaterial,
      renderOrder: 3
    })
    chinaTopLine.lineGroup.position.z += 0.01

    return { china, chinaTopLine }
  }

  /**
   * 创建省份地图（合肥）
   */
  createProvince() {
    let mapJsonData = this.world.assets.instance.getResource('mapJson')
    let [topMaterial, sideMaterial] = this.createProvinceMaterial()
    this.focusMapTopMaterial = topMaterial
    this.focusMapSideMaterial = sideMaterial

    let map = new ExtrudeMap(this.world, {
      geoProjectionCenter: this.world.geoProjectionCenter,
      geoProjectionScale: this.world.geoProjectionScale,
      position: new Vector3(0, 0, 0.11),
      data: mapJsonData,
      depth: this.world.depth,
      topFaceMaterial: topMaterial,
      sideMaterial: sideMaterial,
      renderOrder: 9
    })

    let faceMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5
    })

    let faceGradientShader = new GradientShader(faceMaterial, {
      uColor1: 0x3785f1,
      uColor2: 0x4682ee
    })

    this.defaultMaterial = faceMaterial
    this.defaultLightMaterial = this.defaultMaterial.clone()
    this.defaultLightMaterial.color = new Color('rgba(89,150,242,1)')
    this.defaultLightMaterial.opacity = 0.8

    let mapTop = new BaseMap(this.world, {
      geoProjectionCenter: this.world.geoProjectionCenter,
      geoProjectionScale: this.world.geoProjectionScale,
      position: new Vector3(0, 0, this.world.depth + 0.22),
      data: mapJsonData,
      material: faceMaterial,
      renderOrder: 2
    })

    // 收集可交互元素
    mapTop.mapGroup.children.map((group: any) => {
      group.children.map((mesh: any) => {
        if (mesh.type === 'Mesh') {
          this.eventElement.push(mesh)
        }
      })
    })

    this.mapLineMaterial = new LineBasicMaterial({
      color: 0xffffff,
      opacity: 0,
      transparent: true,
      fog: false,
      depthTest: false // 禁用深度测试，让边界线始终显示在最上层
    })

    // 边界线将在地形创建后再创建，以便获取地形高度数据
    // let mapLine = new Line(...)

    return {
      map,
      mapTop
    }
  }

  /**
   * 创建省份材质
   */
  createProvinceMaterial() {
    let topMaterial = new MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      fog: false,
      side: DoubleSide
    })

    topMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        uColor1: { value: new Color(0x437fea) },
        uColor2: { value: new Color(0x437fea) }
      }
      shader.vertexShader = shader.vertexShader.replace(
        'void main() {',
        `
        attribute float alpha;
        varying vec3 vPosition;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vPosition = position;
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        varying vec3 vPosition;
        varying float vAlpha;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        void main() {
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        /* glsl */ `
      #ifdef OPAQUE
      diffuseColor.a = 1.0;
      #endif
      #ifdef USE_TRANSMISSION
      diffuseColor.a *= transmissionAlpha + 0.1;
      #endif
      vec3 gradient = mix(uColor1, uColor2, vPosition.x/15.78);
      outgoingLight = outgoingLight*gradient;
      float topAlpha = 0.5;
      if(vPosition.z>0.3){
        diffuseColor.a *= topAlpha;
      }
      gl_FragColor = vec4( outgoingLight, diffuseColor.a  );
      `
      )
    }

    let sideMap = this.world.assets.instance.getResource('side')
    sideMap.wrapS = RepeatWrapping
    sideMap.wrapT = RepeatWrapping
    sideMap.repeat.set(1, 1.5)
    sideMap.offset.y += 0.065

    let sideMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      map: sideMap,
      fog: false,
      opacity: 0,
      side: DoubleSide
    })

    this.world.time.on('tick', () => {
      sideMap.offset.y += 0.005
    })

    sideMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        uColor1: { value: new Color(0x437fea) },
        uColor2: { value: new Color(0x437fea) }
      }
      shader.vertexShader = shader.vertexShader.replace(
        'void main() {',
        `
        attribute float alpha;
        varying vec3 vPosition;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vPosition = position;
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        varying vec3 vPosition;
        varying float vAlpha;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        void main() {
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        /* glsl */ `
      #ifdef OPAQUE
      diffuseColor.a = 1.0;
      #endif
      #ifdef USE_TRANSMISSION
      diffuseColor.a *= transmissionAlpha + 0.1;
      #endif
      vec3 gradient = mix(uColor1, uColor2, vPosition.z/1.2);
      outgoingLight = outgoingLight*gradient;
      gl_FragColor = vec4( outgoingLight, diffuseColor.a  );
      `
      )
    }

    return [topMaterial, sideMaterial]
  }

  /**
   * 创建带有地形高度的边界线
   * @param terrain 地形对象
   * @param terrainBounds 地形边界
   * @param terrainOffset 地形偏移
   */
  createMapLineWithTerrain(terrain: any, terrainBounds: any, terrainOffset: any) {
    let mapJsonData = this.world.assets.instance.getResource('mapJson')

    let mapLine = new Line(this.world, {
      geoProjectionCenter: this.world.geoProjectionCenter,
      geoProjectionScale: this.world.geoProjectionScale,
      data: mapJsonData,
      material: this.mapLineMaterial,
      renderOrder: 3,
      type: 'LineLoop', // 明确指定类型
      terrain: terrain,
      terrainBounds: terrainBounds,
      terrainOffset: terrainOffset,
      heightScale: 0.3,
      baseHeight: 0 // 不需要baseHeight，因为边界线位置会通过lineGroup.position设置
    })

    // 保存引用
    this.mapLine = mapLine

    // 设置边界线的Z轴位置，使其在地形表面上方
    mapLine.lineGroup.position.z = this.world.depth + 0.25 + 0.02

    // 添加到场景
    mapLine.setParent(this.focusMapGroup)

    return mapLine
  }
}
