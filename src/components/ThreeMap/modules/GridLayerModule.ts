/*
 * @Author: wanglx
 * @Date: 2025-11-10 18:48:33
 * @LastEditors: @zhangl
 * @LastEditTime: 2026-03-11 14:43:16
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */

import { GridLayer } from '@/utils/three3d/components/GridLayer'
import { windData, windLegend } from '@/utils/three3d/config/mock'
import * as THREE from 'three'
import windUrl from '@/utils/three3d/config/wind.png'

/**
 * 网格图层模块
 * 第一步：简单读取灰度图并按经纬度绘制
 */
export class GridLayerModule {
  private world: any
  public gridLayer!: GridLayer
  public gridLayerGroup!: THREE.Group | null

  constructor(world: any) {
    this.world = world
  }

  /**
   * 创建网格图层 - 添加边界裁剪
   */
  async createGridLayer() {
    try {
      // 灰度图路径
      const imageUrl = windUrl

      // 获取合肥市轮廓边界数据
      const mapStroke = this.world.assets.instance.getResource('mapStroke')

      // 初始化 GridLayer
      this.gridLayer = new GridLayer()

      // 创建网格图层（使用 windData 的经纬度范围）
      this.gridLayerGroup = await this.gridLayer.createFromImage(
        imageUrl,
        {
          startLat: windData.startLat,
          endLat: windData.endLat,
          startLon: windData.startLon,
          endLon: windData.endLon
        },
        windLegend,
        this.world.geoProjection.bind(this.world),
        mapStroke // 传递边界数据
      )

      // 设置位置（与地图同一层级）
      this.gridLayerGroup.position.set(0, 0, this.world.depth + 0.4)

      // 添加到场景
      this.world.mapModule.focusMapGroup.add(this.gridLayerGroup)

      return this.gridLayerGroup
    } catch (error) {
      console.error('❌ 网格图层创建失败:', error)
      throw error
    }
  }

  /**
   * 显示/隐藏图层
   */
  show() {
    if (this.gridLayer) {
      this.gridLayer.setVisible(true)
    }
  }

  hide() {
    if (this.gridLayer) {
      this.gridLayer.setVisible(false)
    }
  }

  /**
   * 销毁图层
   */
  dispose() {
    if (this.gridLayerGroup) {
      this.world.mapModule.focusMapGroup.remove(this.gridLayerGroup)
      this.gridLayerGroup = null
    }
  }
}
