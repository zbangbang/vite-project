import { Color, Raycaster, Vector2, Vector3 } from 'three'
import { geoMercator } from 'd3-geo'

/**
 * 事件模块 - 负责处理地图交互事件
 */
export class EventModule {
  private world: any
  private objectsHover: any[] = []
  private raycaster: Raycaster
  private mouse: Vector2

  constructor(world: any) {
    this.world = world
    this.raycaster = new Raycaster()
    this.mouse = new Vector2()

    // 初始化右键点击事件
    this.initRightClickDebug()
  }

  /**
   * 创建地图区域交互事件
   */
  createEvent(eventElement: any[], defaultMaterial: any, defaultLightMaterial: any) {
    const reset = (mesh: any) => {
      mesh.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.material = defaultMaterial
        }
      })
    }

    const move = (mesh: any) => {
      mesh.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.material = defaultLightMaterial
        }
      })
    }

    eventElement.map((mesh: any) => {
      this.world.interactionManager.add(mesh)

      mesh.addEventListener('mousedown', (ev: any) => {
        console.log(ev.target.userData.name)
      })

      mesh.addEventListener('mouseover', (event: any) => {
        if (!this.objectsHover.includes(event.target.parent)) {
          this.objectsHover.push(event.target.parent)
        }
        document.body.style.cursor = 'pointer'
        move(event.target.parent)
      })

      mesh.addEventListener('mouseout', (event: any) => {
        this.objectsHover = this.objectsHover.filter(
          (n) => n.userData.name !== event.target.parent.userData.name
        )
        if (this.objectsHover.length > 0) {
          const mesh = this.objectsHover[this.objectsHover.length - 1]
        }
        reset(event.target.parent)
        document.body.style.cursor = 'default'
      })
    })
  }

  /**
   * 初始化右键点击调试功能
   */
  private initRightClickDebug() {
    this.world.canvas.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault() // 阻止默认右键菜单

      // 计算鼠标在Canvas中的归一化坐标 (-1 到 1)
      const rect = this.world.canvas.getBoundingClientRect()
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // 更新射线
      this.raycaster.setFromCamera(this.mouse, this.world.camera.instance)

      console.log(
        '%c=== 右键点击调试信息 ===',
        'color: #00ff00; font-size: 14px; font-weight: bold;'
      )

      // 1. 打印相机位置和角度
      this.printCameraInfo()

      // 2. 获取与场景中物体的交点（Three.js坐标系）
      const intersects = this.raycaster.intersectObjects(this.world.scene.children, true)

      if (intersects.length > 0) {
        const point = intersects[0].point

        console.log('%c2. Three.js坐标系位置:', 'color: #ffaa00; font-weight: bold;', {
          x: point.x.toFixed(4),
          y: point.y.toFixed(4),
          z: point.z.toFixed(4),
          raw: `(${point.x}, ${point.y}, ${point.z})`,
          object: intersects[0].object.type,
          distance: intersects[0].distance.toFixed(4)
        })

        // 3. 将Three.js坐标转换为经纬度
        const lonLat = this.worldToLonLat(point.x, point.z)
        console.log('%c3. 经纬度坐标:', 'color: #ff00ff; font-weight: bold;', {
          longitude: lonLat[0].toFixed(6),
          latitude: lonLat[1].toFixed(6),
          raw: `(经度: ${lonLat[0]}, 纬度: ${lonLat[1]})`
        })

        // 4. 获取地形高度信息
        this.printTerrainHeight(point)
      } else {
        console.log('%c2. Three.js坐标系位置:', 'color: #ffaa00;', '未检测到交点')
        console.log('%c3. 经纬度坐标:', 'color: #ff00ff;', '无法计算（未点击到物体）')
        console.log('%c4. 地形高度:', 'color: #00ffaa;', '无法获取（未点击到物体）')
      }

      console.log('%c========================', 'color: #00ff00; font-size: 14px;')
    })
  }

  /**
   * 打印相机信息（位置 + 角度）
   */
  private printCameraInfo() {
    const camera = this.world.camera.instance
    const cameraPos = camera.position
    const cameraRot = camera.rotation

    // 计算欧拉角（弧度转角度）
    const rotationDeg = {
      x: (cameraRot.x * 180) / Math.PI,
      y: (cameraRot.y * 180) / Math.PI,
      z: (cameraRot.z * 180) / Math.PI
    }

    // 获取 OrbitControls 的角度信息（如果存在）
    let orbitInfo = {}
    if (this.world.camera.controls) {
      const controls = this.world.camera.controls
      orbitInfo = {
        azimuthAngle: ((controls.getAzimuthalAngle() * 180) / Math.PI).toFixed(2) + '°',
        polarAngle: ((controls.getPolarAngle() * 180) / Math.PI).toFixed(2) + '°',
        distance: controls.getDistance().toFixed(4),
        target: `(${controls.target.x.toFixed(2)}, ${controls.target.y.toFixed(
          2
        )}, ${controls.target.z.toFixed(2)})`
      }
    }

    console.log('%c1. 相机信息:', 'color: #00ffff; font-weight: bold;', {
      位置: {
        x: cameraPos.x.toFixed(4),
        y: cameraPos.y.toFixed(4),
        z: cameraPos.z.toFixed(4),
        raw: `(${cameraPos.x}, ${cameraPos.y}, ${cameraPos.z})`
      },
      '旋转角度(弧度)': {
        x: cameraRot.x.toFixed(4),
        y: cameraRot.y.toFixed(4),
        z: cameraRot.z.toFixed(4)
      },
      '旋转角度(角度)': {
        x: rotationDeg.x.toFixed(2) + '°',
        y: rotationDeg.y.toFixed(2) + '°',
        z: rotationDeg.z.toFixed(2) + '°'
      },
      ...(Object.keys(orbitInfo).length > 0 && { OrbitControls: orbitInfo })
    })

    // 打印可直接复制粘贴的代码
    console.log(
      `%cx: ${cameraPos.x},\ny: ${cameraPos.y},\nz: ${cameraPos.z},`,
      'color: #00ff00; font-size: 11px; font-family: monospace;'
    )
  }

  /**
   * 打印地形高度信息
   */
  private printTerrainHeight(point: Vector3) {
    const terrainModule = this.world.terrainModule

    if (!terrainModule || !terrainModule.terrain) {
      console.log('%c4. 地形高度:', 'color: #00ffaa;', '地形模块未初始化')
      return
    }

    const terrain = terrainModule.terrain
    const terrainBounds = terrainModule.getTerrainBounds()
    const terrainOffset = terrainModule.getTerrainOffset()

    if (!terrainBounds) {
      console.log('%c4. 地形高度:', 'color: #00ffaa;', '地形边界信息未初始化')
      return
    }

    // 计算归一化坐标（与边界线计算保持一致）
    const offsetX = terrainOffset?.x || 0
    const offsetY = terrainOffset?.y || 0
    const adjustedX = point.x - offsetX
    const adjustedY = point.z - offsetY // 注意：使用 point.z，因为地图旋转了

    const normalizedX = (adjustedX - terrainBounds.minX) / (terrainBounds.maxX - terrainBounds.minX)
    const normalizedZ = (adjustedY - terrainBounds.minY) / (terrainBounds.maxY - terrainBounds.minY)

    // 获取高度
    const clampedX = Math.max(0, Math.min(1, normalizedX))
    const clampedZ = Math.max(0, Math.min(1, normalizedZ))
    const normalizedHeight = terrain.getHeightAt(clampedX, clampedZ)
    const actualHeight = normalizedHeight * 0.3 // heightScale = 0.3

    console.log('%c4. 地形高度信息:', 'color: #00ffaa; font-weight: bold;', {
      '归一化高度(0-1)': normalizedHeight.toFixed(4),
      '实际高度(缩放后)': actualHeight.toFixed(4),
      点击位置Y坐标: point.y.toFixed(4),
      地形归一化坐标: `(x: ${clampedX.toFixed(4)}, z: ${clampedZ.toFixed(4)})`,
      是否在边界内:
        normalizedX >= 0 && normalizedX <= 1 && normalizedZ >= 0 && normalizedZ <= 1 ? '是' : '否'
    })
  }

  /**
   * 将Three.js世界坐标转换为经纬度
   * 这是 geoProjection 的逆过程
   */
  private worldToLonLat(x: number, z: number): [number, number] {
    const projection = geoMercator()
      .center(this.world.geoProjectionCenter)
      .scale(this.world.geoProjectionScale)
      .translate([0, 0])

    // 使用 invert 方法进行逆投影
    const lonLat = projection.invert!([x, z])
    return lonLat as [number, number]
  }
}
