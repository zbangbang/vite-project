import { Group, Vector3 } from 'three'
import { Label3d } from '@/utils/three3d'
import labelIcon from '@/assets/texture/label-icon.png'
import { World } from '../map'
export interface IimageType {
  list: { lat: number | string; lon: number | string; icon: string;[key: string]: any }[]
  size?: [number, number]
  reflect?: boolean
  tilt: number
}

/**
 * 标记层类 - 类似 MarkerLayer 实例
 */
export class MarkerLayer {
  private groupId: string
  private labelModule: LabelModule
  private options: { size?: [number, number]; reflect?: boolean }
  private clickHandler?: (item: any, index: number, event: MouseEvent) => void

  constructor(
    groupId: string,
    labelModule: LabelModule,
    options?: { size?: [number, number]; reflect?: boolean }
  ) {
    this.groupId = groupId
    this.labelModule = labelModule
    this.options = options || {}
  }

  /**
   * 刷新标记点数据
   */
  refresh(data: any[]) {
    this.labelModule.refreshMarkers(this.groupId, data, this.options, this.clickHandler)
    return this
  }

  /**
   * 移除当前标记层
   */
  remove() {
    this.labelModule.removeMarkers(this.groupId)
    return this
  }

  /**
   * 获取当前标记层的数据
   */
  getData() {
    return this.labelModule.getMarkerData(this.groupId)
  }

  /**
   * 获取当前标记层的ID
   */
  getId() {
    return this.groupId
  }

  /**
   * 更新配置选项
   */
  setOptions(options: { size?: [number, number]; reflect?: boolean }) {
    this.options = { ...this.options, ...options }
    return this
  }

  /**
   * 设置点击事件监听器
   * @param handler 点击回调函数，接收 (item, index, event) 参数
   */
  onClick(handler: (item: any, index: number, event: MouseEvent) => void) {
    this.clickHandler = handler
    // 重新刷新以应用点击事件
    const data = this.getData()
    if (data.length > 0) {
      this.refresh(data)
    }
    return this
  }

  /**
   * 更新单个标记点
   * @param index 标记点索引
   * @param newData 新的数据
   */
  updateMarker(index: number, newData: any) {
    this.labelModule.updateSingleMarker(this.groupId, index, newData, this.options)
    return this
  }

  /**
   * 删除单个标记点
   * @param index 标记点索引
   */
  removeMarker(index: number) {
    this.labelModule.removeSingleMarker(this.groupId, index)
    return this
  }

  /**
   * 添加单个标记点
   * @param data 标记点数据
   */
  addMarker(data: any) {
    this.labelModule.addSingleMarker(this.groupId, data, this.options, this.clickHandler)
    return this
  }
}

/**
 * 标签模块 - 负责创建各类标签
 */
export class LabelModule {
  private world: World
  public labelGroup!: Group
  public label3d: Label3d
  public otherLabel: any[] = []
  // 分组管理标记点 - 每个组是一个独立的 MarkerLayer
  private markerGroups: Map<
    string,
    {
      labels: Map<string, any>
      data: any[]
    }
  > = new Map()
  private groupIdCounter: number = 0

  constructor(world: any) {
    this.world = world
    this.labelGroup = new Group()
    this.label3d = new Label3d(this.world)
    this.labelGroup.rotation.x = -Math.PI / 2
    this.world.scene.add(this.labelGroup)
  }

  /**
   * 创建所有标签
   */
  createLabel(chinaData: any[]) {
    let otherLabel: any[] = []

    // 创建中国省份标签
    chinaData.map((province: any) => {
      if (province.hide == true) return false
      let label = this.createChinaLabel(province)
      otherLabel.push(label)
    })

    // // 创建地图焦点标签
    // let mapFocusLabel = this.createMapFocusLabel({
    //   ...this.world.mapFocusLabelInfo,
    // });
    // otherLabel.push(mapFocusLabel);

    // // 创建装饰图标标签
    // let iconLabel1 = this.createDecorationLabel({
    //   icon: labelIcon,
    //   center: [118.280637, 21.625178],
    //   width: "40px",
    //   height: "40px",
    //   reflect: true,
    // });
    // otherLabel.push(iconLabel1);

    // let iconLabel2 = this.createDecorationLabel({
    //   icon: labelIcon,
    //   center: [106.280637, 25.625178],
    //   width: "20px",
    //   height: "20px",
    //   reflect: false,
    // });
    // otherLabel.push(iconLabel2);

    this.otherLabel = otherLabel
  }

  /**
   * 创建中国省份标签
   */
  public createChinaLabel(province: any) {
    let label = this.label3d.create('', `china-label ${province.blur ? ' blur' : ''}`, false)
    const [x, y] = this.world.geoProjection(province.centroid)
    label.init(
      `<div class="other-label">${province.name}</div>`,
      new Vector3(x, -y, this.world.depth + 0.4)
    )
    // 设置标签平行于地面：不设置x轴旋转，因为labelGroup已经旋转了-90度
    // 这样标签会自动平行于地面
    this.label3d.setLabelStyle(label, 0.02, 'x', 0)
    label.setParent(this.labelGroup)
    return label
  }

  /**
   * 创建地图焦点标签
   */
  public createMapFocusLabel(province: any) {
    let label = this.label3d.create('', 'map-label', false)
    const [x, y] = this.world.geoProjection(province.center)
    label.init(
      `<div class="other-label"><span>${province.name}</span><span>${province.enName}</span></div>`,
      new Vector3(x, -y, 0.4)
    )
    this.label3d.setLabelStyle(label, 0.015, 'x')
    label.setParent(this.labelGroup)
    return label
  }

  /**
   * 创建装饰标签
   */
  public createDecorationLabel(
    data: any,
    size: [number, number] = [32, 32],
    onClick?: (item: any, index: number, event: MouseEvent) => void,
    index?: number
  ) {
    let label = this.label3d.create(
      '',
      `decoration-label  ${data.reflect ? ' reflect' : ''}`,
      false
    )
    const [x, y] = this.world.geoProjection([data.lng, data.lat])

    // 在 HTML 内容中直接设置 pointer-events，突破父容器的限制
    const pointerEventsStyle = onClick ? 'pointer-events: auto;' : 'pointer-events: none;'
    label.init(
      `<div class="label-wrapper" style="${pointerEventsStyle} cursor: ${onClick ? 'pointer' : 'default'};"><img class="label-icon" style="width:${size[0]}px;height:${size[1]}px" src="${data.icon}"></div>`,
      new Vector3(x, -y, this.world.depth + 0.4)
    )

    // 不要调用 setLabelStyle 设置 pointerEvents，因为那是设置在 label.element 上的
    // 而 label.element 是 CSS3DObject，它的父容器已经是 pointer-events: none
    this.label3d.setLabelStyle(label, 0.02, 'x', 0, 'none')
    label.setParent(this.labelGroup)

    // 添加点击事件 - 直接绑定到内容元素
    if (onClick && label.element) {
      // 找到 label-wrapper 元素
      const wrapper = label.element.querySelector('.label-wrapper')
      if (wrapper) {
        const clickHandler = (event: MouseEvent) => {
          event.stopPropagation()
          onClick(data, index ?? 0, event)
        }
        wrapper.addEventListener('click', clickHandler)
          // 保存事件处理器，用于后续清理
          ; (label as any)._clickHandler = clickHandler
          ; (label as any)._clickElement = wrapper
      } else {
        console.warn('[ 警告 ] 未找到 label-wrapper 元素')
      }
    }

    return label
  }

  /**
   * 创建标记层 - 类似 new MarkerLayer()
   * @param data 初始数据（可选）
   * @param options 配置选项
   * @returns MarkerLayer 实例
   */
  public createMarkerLayer(
    data?: any[],
    options?: { size?: [number, number]; reflect?: boolean }
  ): MarkerLayer {
    // 自动生成唯一ID
    const groupId = `marker-layer-${++this.groupIdCounter}-${Date.now()}`

    // 确保 CSS3D 渲染器的 z-index 足够高，能够接收点击
    this.label3d.setRenderLevel(9999)

    // 创建标记层实例
    const markerLayer = new MarkerLayer(groupId, this, options)

    // 如果有初始数据，立即刷新
    if (data && data.length > 0) {
      markerLayer.refresh(data)
    }

    return markerLayer
  }

  /**
   * 刷新标记点组 - 内部方法（通过 MarkerLayer 实例调用）
   * @param groupId 组ID
   * @param data 标记点数据数组
   * @param options 配置选项
   * @param onClick 点击事件处理器
   */
  public refreshMarkers(
    groupId: string,
    data: any[],
    options?: { size?: [number, number]; reflect?: boolean },
    onClick?: (item: any, index: number, event: MouseEvent) => void
  ) {
    const size = options?.size || [32, 32]

    // 确保组存在
    if (!this.markerGroups.has(groupId)) {
      this.markerGroups.set(groupId, {
        labels: new Map(),
        data: []
      })
    }

    const group = this.markerGroups.get(groupId)!

    // 生成数据的唯一标识
    const dataKeys = new Set(data.map((item, index) => this.getMarkerKey(item, index)))

    // 删除不再存在的标记点
    group.labels.forEach((label, key) => {
      if (!dataKeys.has(key)) {
        // 移除事件监听
        if ((label as any)._clickHandler && (label as any)._clickElement) {
          ; (label as any)._clickElement.removeEventListener('click', (label as any)._clickHandler)
        }
        // 销毁标签
        if (label && label.destroy) {
          label.destroy()
        }
        group.labels.delete(key)
      }
    })

    // 添加或更新标记点
    data.forEach((item, index) => {
      const key = this.getMarkerKey(item, index)
      const existingLabel = group.labels.get(key)

      // 检查是否需要重新创建标签：
      // 1. 标签不存在
      // 2. 或者 onClick 从无到有（需要添加点击事件）
      // 3. 或者 onClick 从有到无（需要移除点击事件）
      const needRecreate =
        !existingLabel ||
        (onClick && !(existingLabel as any)._clickHandler) ||
        (!onClick && (existingLabel as any)._clickHandler)

      if (needRecreate) {
        // 删除旧标签
        if (existingLabel) {
          if ((existingLabel as any)._clickHandler && (existingLabel as any)._clickElement) {
            ; (existingLabel as any)._clickElement.removeEventListener(
              'click',
              (existingLabel as any)._clickHandler
            )
          }
          if (existingLabel.destroy) {
            existingLabel.destroy()
          }
          group.labels.delete(key)
        }

        // 创建新标记点
        const label = this.createDecorationLabel(
          {
            ...item,
            reflect: item.reflect ?? options?.reflect ?? false
          },
          item.size || size,
          onClick,
          index
        )
        group.labels.set(key, label)
      }
    })

    group.data = data
  }

  /**
   * 更新单个标记点
   * @param groupId 组ID
   * @param index 标记点索引
   * @param newData 新数据
   * @param options 配置选项
   */
  public updateSingleMarker(
    groupId: string,
    index: number,
    newData: any,
    options?: { size?: [number, number]; reflect?: boolean }
  ) {
    const group = this.markerGroups.get(groupId)
    if (!group || !group.data[index]) return

    // 更新数据
    const oldData = group.data[index]
    group.data[index] = { ...oldData, ...newData }

    // 删除标签
    const key = this.getMarkerKey(oldData, index)
    const oldLabel = group.labels.get(key)
    if (oldLabel) {
      if ((oldLabel as any)._clickHandler && (oldLabel as any)._clickElement) {
        ; (oldLabel as any)._clickElement.removeEventListener(
          'click',
          (oldLabel as any)._clickHandler
        )
      }
      if (oldLabel.destroy) {
        oldLabel.destroy()
      }
      group.labels.delete(key)
    }

    // 创建新标签
    const size = options?.size || [32, 32]
    const newKey = this.getMarkerKey(group.data[index], index)
    const newLabel = this.createDecorationLabel(
      {
        ...group.data[index],
        reflect: group.data[index].reflect ?? options?.reflect ?? false
      },
      group.data[index].size || size,
      undefined,
      index
    )
    group.labels.set(newKey, newLabel)
  }

  /**
   * 删除单个标记点
   * @param groupId 组ID
   * @param index 标记点索引
   */
  public removeSingleMarker(groupId: string, index: number) {
    const group = this.markerGroups.get(groupId)
    if (!group || !group.data[index]) return

    // 删除标签
    const key = this.getMarkerKey(group.data[index], index)
    const label = group.labels.get(key)
    if (label) {
      if ((label as any)._clickHandler && (label as any)._clickElement) {
        ; (label as any)._clickElement.removeEventListener('click', (label as any)._clickHandler)
      }
      if (label.destroy) {
        label.destroy()
      }
      group.labels.delete(key)
    }

    // 从数据中删除
    group.data.splice(index, 1)

    // 重新刷新所有标记点（因为索引变了）
    this.refreshMarkers(groupId, group.data)
  }

  /**
   * 添加单个标记点
   * @param groupId 组ID
   * @param data 标记点数据
   * @param options 配置选项
   * @param onClick 点击事件处理器
   */
  public addSingleMarker(
    groupId: string,
    data: any,
    options?: { size?: [number, number]; reflect?: boolean },
    onClick?: (item: any, index: number, event: MouseEvent) => void
  ) {
    const group = this.markerGroups.get(groupId)
    if (!group) return

    // 添加到数据数组
    group.data.push(data)
    const index = group.data.length - 1

    // 创建新标签
    const size = options?.size || [32, 32]
    const key = this.getMarkerKey(data, index)
    const label = this.createDecorationLabel(
      {
        ...data,
        reflect: data.reflect ?? options?.reflect ?? false
      },
      data.size || size,
      onClick,
      index
    )
    group.labels.set(key, label)
  }

  /**
   * 清除指定组的标记点 - 内部方法（通过 MarkerLayer 实例调用）
   * @param groupId 组ID，如果不传则清除所有组
   */
  public removeMarkers(groupId?: string) {
    if (groupId) {
      // 清除指定组
      const group = this.markerGroups.get(groupId)
      if (group) {
        group.labels.forEach((label) => {
          // 移除事件监听
          if ((label as any)._clickHandler && (label as any)._clickElement) {
            ; (label as any)._clickElement.removeEventListener('click', (label as any)._clickHandler)
          }
          if (label && label.destroy) {
            label.destroy()
          }
        })
        this.markerGroups.delete(groupId)
      }
    } else {
      // 清除所有组
      this.markerGroups.forEach((group) => {
        group.labels.forEach((label) => {
          // 移除事件监听
          if ((label as any)._clickHandler && (label as any)._clickElement) {
            ; (label as any)._clickElement.removeEventListener('click', (label as any)._clickHandler)
          }
          if (label && label.destroy) {
            label.destroy()
          }
        })
      })
      this.markerGroups.clear()
    }
  }

  /**
   * 获取标记点数据
   * @param groupId 组ID，如果不传则返回所有组的数据
   */
  public getMarkerData(groupId?: string) {
    if (groupId) {
      return this.markerGroups.get(groupId)?.data || []
    } else {
      // 返回所有组的数据
      const allData: any[] = []
      this.markerGroups.forEach((group) => {
        allData.push(...group.data)
      })
      return allData
    }
  }

  /**
   * 获取所有组的ID列表
   */
  public getMarkerGroupIds(): string[] {
    return Array.from(this.markerGroups.keys())
  }

  /**
   * 检查组是否存在
   */
  public hasMarkerGroup(groupId: string): boolean {
    return this.markerGroups.has(groupId)
  }

  /**
   * 生成标记点唯一键
   */
  private getMarkerKey(item: any, index: number): string {
    // 使用经纬度和索引生成唯一键
    return item.id || `${item.lng}_${item.lat}_${index}`
  }

  /**
   * 创建信息点标签
   */
  createInfoLabel(data: any, position: Vector3) {
    let label = this.label3d.create('', 'info-point', true)
    label.init(
      `<div class="info-point-wrap">
        <div class="info-point-wrap-inner">
          <div class="info-point-line">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
          <div class="info-point-content">
            <div class="content-item"><span class="label">名称</span><span class="value">${data.name}</span></div>
            <div class="content-item"><span class="label">PM2.5</span><span class="value">${data.value}ug/m²</span></div>
            <div class="content-item"><span class="label">等级</span><span class="value">${data.level}</span></div>
          </div>
        </div>
      </div>`,
      position
    )
    this.label3d.setLabelStyle(label, 0.015, 'x')
    label.visible = false
    return label
  }

  /**
   * 销毁标签资源
   */
  dispose() {
    // 清除所有标记点
    this.removeMarkers()

    if (this.label3d) {
      this.label3d.destroy()
    }
  }
}
