import {
  Group,
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
  RepeatWrapping,
  NearestFilter,
  LinearFilter,
  ClampToEdgeWrapping,
  DoubleSide,
  AdditiveBlending,
  CustomBlending,
  AddEquation,
  DstColorFactor,
  OneFactor,
  PointsMaterial,
  Vector3
} from 'three'
import { Grid, Plane, Particles, DiffuseShader, Line } from '@/utils/three3d'
import gsap from 'gsap'

/**
 * 装饰效果模块 - 负责创建粒子、网格、光晕等装饰效果
 */
export class DecorationModule {
  private world: any
  public particles: any
  public particleGroup!: Group

  constructor(world: any) {
    this.world = world
  }

  /**
   * 创建扩散网格
   */
  createGrid() {
    new Grid(this.world, {
      gridSize: 50,
      gridDivision: 20,
      gridColor: 0x1b4b70,
      shapeSize: 0.5,
      shapeColor: 0x2a5f8a,
      pointSize: 0.1,
      pointColor: 0x154d7d
    })
  }

  /**
   * 创建底部背景
   */
  createBottomBg() {
    let geometry = new PlaneGeometry(20, 20)
    const texture = this.world.assets.instance.getResource('ocean')
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)

    let material = new MeshBasicMaterial({
      map: texture,
      opacity: 1,
      fog: false
    })

    let mesh = new Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(0, -0.7, 0)
    this.world.scene.add(mesh)
  }

  /**
   * 创建中国模糊边线
   */
  createChinaBlurLine() {
    let geometry = new PlaneGeometry(147, 147)
    const texture = this.world.assets.instance.getResource('chinaBlurLine')
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.generateMipmaps = false
    texture.minFilter = NearestFilter
    texture.repeat.set(1, 1)

    let material = new MeshBasicMaterial({
      color: 0x3f82cd,
      alphaMap: texture,
      transparent: true,
      opacity: 0.5
    })

    let mesh = new Mesh(geometry, material)
    mesh.rotateX(-Math.PI / 2)
    mesh.position.set(-19.3, -0.5, -19.7)
    this.world.scene.add(mesh)
  }

  /**
   * 创建扩散效果
   */
  createDiffuse() {
    let geometry = new PlaneGeometry(200, 200)
    let material = new MeshBasicMaterial({
      color: 0x000000,
      depthWrite: false,
      transparent: true,
      blending: CustomBlending
    })

    // 使用CustomBlending实现混合叠加
    material.blendEquation = AddEquation
    material.blendSrc = DstColorFactor
    material.blendDst = OneFactor

    let diffuse = new DiffuseShader({
      material,
      time: this.world.time,
      size: 60,
      diffuseSpeed: 8.0,
      diffuseColor: 0x71918e,
      diffuseWidth: 2.0,
      callback: (pointShader: any) => {
        setTimeout(() => {
          gsap.to(pointShader.uniforms.uTime, {
            value: 4,
            repeat: -1,
            duration: 6,
            ease: 'power1.easeIn'
          })
        }, 3)
      }
    })

    let mesh = new Mesh(geometry, material)
    mesh.renderOrder = 3
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(0, 0.21, 0)
    this.world.scene.add(mesh)
  }

  /**
   * 创建粒子
   */
  createParticles() {
    this.particles = new Particles(this.world, {
      num: 10,
      range: 30,
      dir: 'up',
      speed: 0.05,
      material: new PointsMaterial({
        map: Particles.createTexture(),
        size: 1,
        color: 0x00eeee,
        transparent: true,
        opacity: 1,
        depthTest: false,
        depthWrite: false,
        vertexColors: true,
        blending: AdditiveBlending,
        sizeAttenuation: true
      })
    })

    this.particleGroup = new Group()
    this.world.scene.add(this.particleGroup)
    this.particleGroup.rotation.x = -Math.PI / 2
    this.particles.setParent(this.particleGroup)
    this.particles.enable = true
    this.particleGroup.visible = true
  }

  /**
   * 创建海洋世界背景（参照createRotateBorder方式）
   */
  createOceanWorldBg() {
    let oceanWorldBg = this.world.assets.instance.getResource('oceanWorldBg')

    // 设置正确的颜色空间，避免色差
    oceanWorldBg.colorSpace = SRGBColorSpace

    // 设置纹理过滤方式，提高清晰度
    oceanWorldBg.minFilter = LinearFilter
    oceanWorldBg.magFilter = LinearFilter
    oceanWorldBg.anisotropy = this.world.renderer.instance.capabilities.getMaxAnisotropy()
    oceanWorldBg.generateMipmaps = true

    // 避免重复模式，防止拉伸
    oceanWorldBg.wrapS = ClampToEdgeWrapping
    oceanWorldBg.wrapT = ClampToEdgeWrapping

    // 根据图片比例创建长方形平面（假设原图是 16:9 比例）
    // 如果你知道准确比例，可以调整 width 和 height
    const width = 13 // 宽度
    const height = 12 // 高度 (16:9 比例)

    const geometry = new PlaneGeometry(width, height)
    const material = new MeshBasicMaterial({
      map: oceanWorldBg,
      transparent: true,
      opacity: 0.5,
      side: DoubleSide,
      depthWrite: false
    })

    const oceanBgPlane = new Mesh(geometry, material)
    oceanBgPlane.position.set(0, 0.3, 0) // 保持你的值
    oceanBgPlane.rotation.x = -Math.PI / 2
    oceanBgPlane.renderOrder = 6 // 保持你的值

    this.world.scene.add(oceanBgPlane)

    return oceanBgPlane
  }

  /**
   * 创建地图轮廓线
   */
  createStroke() {
    const mapStroke = this.world.assets.instance.getResource('mapStroke')
    const texture = this.world.assets.instance.getResource('pathLine3')
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(2, 1)

    let pathLine = new Line(this.world, {
      geoProjectionCenter: this.world.geoProjectionCenter,
      geoProjectionScale: this.world.geoProjectionScale,
      position: new Vector3(0, 0, this.world.depth + 0.24),
      data: mapStroke,
      material: new MeshBasicMaterial({
        color: 0x2bc4dc,
        map: texture,
        alphaMap: texture,
        fog: false,
        transparent: true,
        opacity: 1,
        blending: AdditiveBlending
      }),
      type: 'Line3',
      renderOrder: 22,
      tubeRadius: 0.03
    })

    this.world.time.on('tick', () => {
      texture.offset.x += 0.005
    })

    return pathLine
  }
}
