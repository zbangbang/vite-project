import { Group, Vector3, Sprite, SpriteMaterial } from 'three'

interface DataItem {
  value: number
  [key: string]: any
}

function sortByValue(data: DataItem[]): DataItem[] {
  data.sort((a, b) => b.value - a.value)
  return data
}

/**
 * 可视化元素模块 - 负责创建散点图、信息点等可视化元素
 */
export class VisualizationModule {
  private world: any
  public scatterGroup!: Group
  public InfoPointGroup!: Group
  public infoPointIndex!: number
  public infoPointLabelTime: any
  public infoLabelElement: any[] = []

  constructor(world: any) {
    this.world = world
  }

  /**
   * 创建散点图
   */
  createScatter(scatterData: any[]) {
    this.scatterGroup = new Group()
    this.scatterGroup.visible = false
    this.scatterGroup.rotation.x = -Math.PI / 2
    this.world.scene.add(this.scatterGroup)

    // 如果数据为空，直接返回
    if (!scatterData || scatterData.length === 0) {
      console.warn('散点图数据为空')
      return
    }

    const texture = this.world.assets.instance.getResource('arrow')
    const material = new SpriteMaterial({
      map: texture,
      color: 0xfffef4,
      fog: false,
      transparent: true,
      depthTest: false
    })

    let scatterAllData = sortByValue(scatterData)
    let max = scatterAllData[0].value

    scatterAllData.map((data) => {
      const sprite = new Sprite(material)
      sprite.renderOrder = 23
      let scale = 0.1 + (data.value / max) * 0.2
      sprite.scale.set(scale, scale, scale)
      let [x, y] = this.world.geoProjection([data.lng, data.lat])
      sprite.position.set(x, -y, this.world.depth + 0.45)
      sprite.userData.position = [x, -y, this.world.depth + 0.45]
      this.scatterGroup.add(sprite)
    })
  }

  /**
   * 创建信息点
   */
  createInfoPoint(labelModule: any, interactionManager: any, infoData: any[]) {
    this.InfoPointGroup = new Group()
    this.world.scene.add(this.InfoPointGroup)
    this.InfoPointGroup.visible = false
    this.InfoPointGroup.rotation.x = -Math.PI / 2
    this.infoPointIndex = 0
    this.infoPointLabelTime = null
    this.infoLabelElement = []

    const texture = this.world.assets.instance.getResource('point')
    let colors = [0xfffef4, 0x77fbf5]
    let infoAllData = sortByValue(infoData)

    if (!infoAllData || infoAllData.length === 0) {
      console.warn('信息点数据为空')
      return
    }

    let max = infoAllData[0].value

    infoAllData.map((data: any, index: number) => {
      const material = new SpriteMaterial({
        map: texture,
        color: colors[index % colors.length],
        fog: false,
        transparent: true,
        depthTest: false
      })

      const sprite = new Sprite(material)
      sprite.renderOrder = 23
      let scale = 0.7 + (data.value / max) * 0.4
      sprite.scale.set(scale, scale, scale)

      let [x, y] = this.world.geoProjection([data.lng, data.lat])
      let position: [number, number, number] = [x, -y, this.world.depth + 0.7]
      sprite.position.set(...position)
      sprite.userData.position = [...position]
      sprite.userData = {
        position: [x, -y, this.world.depth + 0.7],
        name: data.name,
        value: data.value,
        level: data.level,
        index: index
      }

      this.InfoPointGroup.add(sprite)

      // 创建信息点标签
      let label = labelModule.createInfoLabel(data, new Vector3(x, -y, this.world.depth + 1.9))
      label.setParent(this.InfoPointGroup)
      this.infoLabelElement.push(label)

      // 添加交互事件
      interactionManager.add(sprite)
      sprite.addEventListener('mousedown', (ev: any) => {
        if (this.world.clicked || !this.InfoPointGroup.visible) return false
        this.world.clicked = true
        this.infoPointIndex = ev.target.userData.index
        this.infoLabelElement.map((label) => {
          label.visible = false
        })
        label.visible = true
        this.createInfoPointLabelLoop()
      })

      sprite.addEventListener('mouseup', (ev: any) => {
        this.world.clicked = false
      })

      sprite.addEventListener('mouseover', (event: any) => {
        document.body.style.cursor = 'pointer'
      })

      sprite.addEventListener('mouseout', (event: any) => {
        document.body.style.cursor = 'default'
      })
    })
  }

  /**
   * 创建信息点标签循环显示
   */
  createInfoPointLabelLoop() {
    clearInterval(this.infoPointLabelTime)
    this.infoPointLabelTime = setInterval(() => {
      this.infoPointIndex++
      if (this.infoPointIndex >= this.infoLabelElement.length) {
        this.infoPointIndex = 0
      }
      this.infoLabelElement.map((label: any, i: number) => {
        if (this.infoPointIndex === i) {
          label.visible = true
        } else {
          label.visible = false
        }
      })
    }, 3000)
  }

  /**
   * 销毁资源
   */
  dispose() {
    clearInterval(this.infoPointLabelTime)
  }
}
