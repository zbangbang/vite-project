import {
  BufferGeometry,
  BufferAttribute,
  Points,
  PointsMaterial,
  AdditiveBlending,
  TextureLoader,
  CanvasTexture,
  Vector3,
  Box3,
  Color,
} from "three";

/**
 * 降雨粒子配置接口
 */
export interface RainConfig {
  /** 粒子数量 */
  particleCount?: number;
  /** 降雨高度（起始位置） */
  rainHeight?: number;
  /** 降雨速度 */
  rainSpeed?: number;
  /** 粒子大小 */
  particleSize?: number;
  /** 粒子透明度 (0-1) */
  opacity?: number;
  /** 粒子颜色 */
  color?: number;
  /** 纹理图片地址或纹理对象（可选，不传则使用默认渐变纹理） */
  textureUrl?: string | any;
  /** 降雨区域的Z轴偏移（用于适配地形高度） */
  zOffset?: number;
  /** 渲染顺序 */
  renderOrder?: number;
}

/**
 * 降雨效果模块 - 基于GeoJSON区域生成降雨粒子效果
 */
export class RainModule {
  private world: any;
  private rainSystems: Map<string, Points> = new Map();
  private velocities: Map<string, Float32Array> = new Map();
  // 存储每个降雨系统的区域信息
  private regionBounds: Map<
    string,
    { minX: number; maxX: number; minY: number; maxY: number }
  > = new Map();
  private regionCoordinates: Map<string, number[][]> = new Map();

  constructor(world: any) {
    this.world = world;
  }

  /**
   * 创建默认雨滴纹理
   */
  private createDefaultRainTexture(): CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d")!;

    // 创建垂直渐变，模拟雨滴形状
    const gradient = context.createLinearGradient(32, 0, 32, 64);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.3, "rgba(255,255,255,0.8)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.8)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    const texture = new CanvasTexture(canvas);
    return texture;
  }

  /**
   * 加载自定义纹理
   */
  private async loadTexture(urlOrTexture: string | any): Promise<any> {
    // 如果已经是纹理对象,直接返回
    if (
      urlOrTexture &&
      typeof urlOrTexture === "object" &&
      urlOrTexture.isTexture
    ) {
      return urlOrTexture;
    }

    // 如果是字符串URL,加载纹理
    if (typeof urlOrTexture === "string") {
      return new Promise((resolve, reject) => {
        const loader = new TextureLoader();
        loader.load(
          urlOrTexture,
          (texture) => {
            resolve(texture);
          },
          undefined,
          (error) => {
            console.error("雨滴纹理加载失败:", error);
            reject(error);
          }
        );
      });
    }

    // 其他情况抛出错误
    throw new Error("textureUrl 必须是图片URL字符串或纹理对象");
  }

  /**
   * 解析GeoJSON边界，获取区域范围
   */
  private parseGeoJSONBounds(geojson: any): {
    coordinates: number[][];
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
  } {
    const allCoordinates: number[][] = [];
    let minLon = Infinity,
      maxLon = -Infinity;
    let minLat = Infinity,
      maxLat = -Infinity;

    // 处理FeatureCollection
    if (geojson.type === "FeatureCollection") {
      geojson.features.forEach((feature: any, index: number) => {
        console.log(`Feature ${index}:`, {
          type: feature?.type,
          geometryType: feature?.geometry?.type,
        });
        this.extractCoordinates(feature.geometry, allCoordinates);
      });
    } else if (geojson.type === "Feature") {
      this.extractCoordinates(geojson.geometry, allCoordinates);
    } else {
      // 直接是Geometry
      this.extractCoordinates(geojson, allCoordinates);
    }

    console.log(`提取到 ${allCoordinates.length} 个坐标点`);

    // 计算经纬度边界
    allCoordinates.forEach(([lon, lat]) => {
      if (
        lon !== undefined &&
        lat !== undefined &&
        !isNaN(lon) &&
        !isNaN(lat)
      ) {
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
    });

    // 转换为投影坐标，并过滤掉无效值
    const projectedCoords: number[][] = [];
    let failedCount = 0;

    allCoordinates.forEach((coord, index) => {
      try {
        // 直接使用 world 的投影方法
        const projected = this.world.geoProjection(coord);
        // 检查投影结果是否有效（d3-geo在坐标超出范围时会返回null）
        if (
          projected &&
          Array.isArray(projected) &&
          projected.length === 2 &&
          projected[0] !== null &&
          projected[1] !== null &&
          !isNaN(projected[0]) &&
          !isNaN(projected[1]) &&
          isFinite(projected[0]) &&
          isFinite(projected[1])
        ) {
          projectedCoords.push(projected);
        } else {
          failedCount++;
          if (failedCount <= 5) {
            console.warn(
              `坐标投影失败 [${index}]: [${coord[0]}, ${
                coord[1]
              }] -> ${JSON.stringify(projected)}`
            );
          }
        }
      } catch (error) {
        failedCount++;
        if (failedCount <= 5) {
          console.error(
            `坐标投影异常 [${index}]: [${coord[0]}, ${coord[1]}]`,
            error
          );
        }
      }
    });

    if (failedCount > 0) {
      console.warn(
        `共有 ${failedCount} 个坐标投影失败（总计 ${allCoordinates.length} 个）`
      );
    }

    // 如果没有有效的投影坐标，抛出错误
    if (projectedCoords.length === 0) {
      console.error("GeoJSON 坐标投影失败，请检查坐标范围是否正确");
      console.error(
        `投影中心: [${this.world.geoProjectionCenter[0]}, ${this.world.geoProjectionCenter[1]}]`
      );
      console.error(`投影缩放: ${this.world.geoProjectionScale}`);
      throw new Error("无效的GeoJSON坐标，投影后没有有效点");
    }

    // 如果有效坐标太少，发出警告
    const validRatio = projectedCoords.length / allCoordinates.length;
    if (validRatio < 0.5) {
      console.warn(
        `警告：只有 ${(validRatio * 100).toFixed(
          1
        )}% 的坐标投影成功，降雨效果可能不完整`
      );
    }

    // 计算投影后的边界
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    projectedCoords.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    return {
      coordinates: projectedCoords,
      bounds: { minX, maxX, minY, maxY },
    };
  }

  /**
   * 递归提取坐标
   */
  private extractCoordinates(geometry: any, coordinates: number[][]) {
    if (!geometry) {
      console.warn("geometry 为空");
      return;
    }

    switch (geometry.type) {
      case "Point":
        coordinates.push(geometry.coordinates);
        break;
      case "MultiPoint":
      case "LineString":
        coordinates.push(...geometry.coordinates);
        break;
      case "Polygon":
        // Polygon: [ [[lon, lat], [lon, lat], ...] ]
        geometry.coordinates.forEach((ring: any) => {
          if (Array.isArray(ring)) {
            coordinates.push(...ring);
          }
        });
        break;
      case "MultiPolygon":
        geometry.coordinates.forEach((polygon: any, pIndex: number) => {
          polygon.forEach((ring: any, rIndex: number) => {
            if (Array.isArray(ring)) {
              coordinates.push(...ring);
            }
          });
        });
        break;
      case "MultiLineString":
        geometry.coordinates.forEach((line: any) => {
          coordinates.push(...line);
        });
        break;
      case "GeometryCollection":
        geometry.geometries.forEach((geom: any) => {
          this.extractCoordinates(geom, coordinates);
        });
        break;
      default:
        console.warn(`未知的 geometry 类型: ${geometry.type}`);
    }
  }

  /**
   * 判断点是否在多边形内（射线法）
   */
  private isPointInPolygon(point: number[], polygon: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0],
        yi = polygon[i][1];
      const xj = polygon[j][0],
        yj = polygon[j][1];

      const intersect =
        yi > point[1] !== yj > point[1] &&
        point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * 在指定区域内生成随机点
   */
  private generatePointsInBounds(
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
    coordinates: number[][],
    count: number
  ): Vector3[] {
    const points: Vector3[] = [];
    let attempts = 0;
    const maxAttempts = count * 10; // 避免无限循环

    // 验证边界是否有效
    if (
      !isFinite(bounds.minX) ||
      !isFinite(bounds.maxX) ||
      !isFinite(bounds.minY) ||
      !isFinite(bounds.maxY) ||
      bounds.minX >= bounds.maxX ||
      bounds.minY >= bounds.maxY
    ) {
      console.error("无效的边界范围", bounds);
      throw new Error("无法在无效的边界范围内生成点");
    }

    while (points.length < count && attempts < maxAttempts) {
      const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);

      // 验证生成的坐标是否有效
      if (!isFinite(x) || !isFinite(y)) {
        attempts++;
        continue;
      }

      // 简化判断：如果有坐标数据，进行多边形判断；否则直接使用
      if (coordinates.length > 3) {
        if (this.isPointInPolygon([x, y], coordinates)) {
          points.push(new Vector3(x, 0, y));
        }
      } else {
        points.push(new Vector3(x, 0, y));
      }

      attempts++;
    }

    // 如果点数不足，用边界内的随机点补充
    while (points.length < count) {
      const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);

      if (isFinite(x) && isFinite(y)) {
        points.push(new Vector3(x, 0, y));
      } else {
        // 如果连随机点都生成失败，避免无限循环
        break;
      }
    }

    return points;
  }

  /**
   * 创建降雨效果
   * @param id 降雨系统的唯一标识
   * @param geojson GeoJSON数据（支持FeatureCollection格式）
   * @param config 降雨配置
   */
  async createRain(
    id: string,
    geojson: any,
    config: RainConfig = {}
  ): Promise<Points> {
    // 如果已存在相同ID的降雨系统，先移除
    if (this.rainSystems.has(id)) {
      this.removeRain(id);
    }

    // 默认配置
    const {
      particleCount = 1000,
      rainHeight = 10,
      rainSpeed = 0.1,
      particleSize = 0.3,
      opacity = 0.6,
      color = 0xaaaaff,
      textureUrl,
      zOffset = 0,
      renderOrder = 100,
    } = config;

    // 解析GeoJSON边界
    const { coordinates, bounds } = this.parseGeoJSONBounds(geojson);

    // 在区域内生成粒子位置
    const basePoints = this.generatePointsInBounds(
      bounds,
      coordinates,
      particleCount
    );

    // 创建粒子几何体
    const positions: number[] = [];
    const velocities: number[] = [];
    const colors: number[] = [];

    basePoints.forEach((point) => {
      // 验证点的坐标是否有效
      if (
        isNaN(point.x) ||
        isNaN(point.y) ||
        isNaN(point.z) ||
        !isFinite(point.x) ||
        !isFinite(point.y) ||
        !isFinite(point.z)
      ) {
        console.warn("检测到无效的粒子坐标，跳过", point);
        return;
      }

      // 随机高度分布
      const height = rainHeight * Math.random();
      positions.push(point.x, height, point.y + zOffset);

      // 速度（主要是Y轴向下）
      const speedVariation = 0.8 + Math.random() * 0.4; // 0.8-1.2倍速度变化
      velocities.push(
        (Math.random() - 0.5) * 0.01, // 微小的X轴偏移
        -rainSpeed * speedVariation, // Y轴向下
        (Math.random() - 0.5) * 0.01 // 微小的Z轴偏移
      );

      // 颜色变化
      const colorObj = new Color(color);
      const hsl: any = {};
      colorObj.getHSL(hsl);
      colorObj.setHSL(hsl.h, hsl.s, hsl.l * (0.8 + Math.random() * 0.2));
      colors.push(colorObj.r, colorObj.g, colorObj.b);
    });

    // 验证是否有有效的粒子生成
    if (positions.length === 0) {
      console.error("没有生成有效的粒子位置");
      throw new Error("降雨效果创建失败：无法生成有效粒子");
    }

    // 创建缓冲几何体
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(positions), 3)
    );
    geometry.setAttribute(
      "color",
      new BufferAttribute(new Float32Array(colors), 3)
    );

    // 保存速度数据
    const velocityArray = new Float32Array(velocities);
    this.velocities.set(id, velocityArray);

    // 保存区域边界和坐标信息，用于粒子边界检测
    this.regionBounds.set(id, bounds);
    this.regionCoordinates.set(id, coordinates);

    // 加载或创建纹理
    let texture;
    if (textureUrl) {
      try {
        texture = await this.loadTexture(textureUrl);
      } catch (error) {
        console.warn("加载纹理失败，使用默认纹理:", error);
        texture = this.createDefaultRainTexture();
      }
    } else {
      console.log("未指定纹理，使用默认纹理");
      texture = this.createDefaultRainTexture();
    }

    // 创建材质
    const material = new PointsMaterial({
      map: texture,
      size: particleSize,
      color: 0xffffff,
      transparent: true,
      opacity: opacity,
      depthTest: true,
      depthWrite: false,
      vertexColors: true,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    });

    // 创建粒子系统
    const rainSystem = new Points(geometry, material);
    rainSystem.renderOrder = renderOrder;
    rainSystem.name = `rain_${id}`;

    // 保存到映射表
    this.rainSystems.set(id, rainSystem);

    // 添加到场景
    this.world.scene.add(rainSystem);

    // 启动更新循环
    this.startRainAnimation(id, rainHeight, bounds, zOffset);

    return rainSystem;
  }

  /**
   * 启动降雨动画
   */
  private startRainAnimation(
    id: string,
    rainHeight: number,
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
    zOffset: number
  ) {
    const updateHandler = (delta: number, elapsedTime: number) => {
      const rainSystem = this.rainSystems.get(id);
      const velocities = this.velocities.get(id);
      const regionBounds = this.regionBounds.get(id);
      const regionCoordinates = this.regionCoordinates.get(id);

      if (!rainSystem || !velocities || !regionBounds) {
        // 降雨系统已被移除，取消监听
        this.world.time.off("tick", updateHandler);
        return;
      }

      const position = rainSystem.geometry.getAttribute("position");
      const count = position.count;

      for (let i = 0; i < count; i++) {
        const index = i * 3;

        // 获取当前位置
        let x = position.getX(i);
        let y = position.getY(i);
        let z = position.getZ(i);

        // 应用速度
        x += velocities[index];
        y += velocities[index + 1];
        z += velocities[index + 2];

        // 检查粒子是否超出区域边界或落到地面
        const needReset =
          y < 0 ||
          x < regionBounds.minX ||
          x > regionBounds.maxX ||
          z - zOffset < regionBounds.minY ||
          z - zOffset > regionBounds.maxY;

        if (needReset) {
          // 重置粒子到区域内的随机位置
          y = rainHeight * (0.5 + Math.random() * 0.5); // 随机高度，避免同时重置的粒子太整齐

          // 生成新的区域内位置
          let attempts = 0;
          let validPosition = false;

          while (!validPosition && attempts < 20) {
            x =
              regionBounds.minX +
              Math.random() * (regionBounds.maxX - regionBounds.minX);
            const newZ =
              regionBounds.minY +
              Math.random() * (regionBounds.maxY - regionBounds.minY);

            // 如果有坐标数据，检查是否在多边形内
            if (regionCoordinates && regionCoordinates.length > 3) {
              if (this.isPointInPolygon([x, newZ], regionCoordinates)) {
                z = newZ + zOffset;
                validPosition = true;
              }
            } else {
              z = newZ + zOffset;
              validPosition = true;
            }

            attempts++;
          }

          // 如果多次尝试都失败，使用边界内的位置（不检查多边形）
          if (!validPosition) {
            x =
              regionBounds.minX +
              Math.random() * (regionBounds.maxX - regionBounds.minX);
            z =
              regionBounds.minY +
              Math.random() * (regionBounds.maxY - regionBounds.minY) +
              zOffset;
          }
        }

        // 更新位置
        position.setX(i, x);
        position.setY(i, y);
        position.setZ(i, z);
      }

      position.needsUpdate = true;
    };

    // 注册到时间系统
    this.world.time.on("tick", updateHandler);
  }

  /**
   * 为多个区域创建降雨效果（自动处理 FeatureCollection）
   * @param baseId 基础ID，会为每个 Feature 生成 baseId_0, baseId_1 等
   * @param geojson GeoJSON数据（支持FeatureCollection格式）
   * @param config 降雨配置
   * @returns 返回所有创建的降雨系统 ID 数组
   */
  async createRainForRegions(
    baseId: string,
    geojson: any,
    config: RainConfig = {}
  ): Promise<string[]> {
    const createdIds: string[] = [];

    // 处理 FeatureCollection
    if (geojson.type === "FeatureCollection") {
      for (let i = 0; i < geojson.features.length; i++) {
        const feature = geojson.features[i];
        const featureId = `${baseId}_${i}`;
        try {
          await this.createRain(featureId, feature, config);
          createdIds.push(featureId);
        } catch (error) {
          console.error(`区域 ${i + 1} 降雨效果创建失败:`, error);
        }
      }
    } else {
      // 单个 Feature 或 Geometry
      await this.createRain(baseId, geojson, config);
      createdIds.push(baseId);
    }

    return createdIds;
  }

  /**
   * 移除指定基础ID的所有降雨效果
   * @param baseId 基础ID，会移除所有 baseId_* 格式的效果
   */
  removeRainByBaseId(baseId: string): void {
    const idsToRemove: string[] = [];

    // 找到所有匹配的 ID
    this.rainSystems.forEach((_, id) => {
      if (id === baseId || id.startsWith(`${baseId}_`)) {
        idsToRemove.push(id);
      }
    });

    // 移除所有匹配的效果
    idsToRemove.forEach((id) => {
      this.removeRain(id);
    });
  }

  /**
   * 更新指定基础ID的所有降雨效果配置
   * @param baseId 基础ID
   * @param config 配置参数
   */
  updateRainConfigByBaseId(baseId: string, config: Partial<RainConfig>): void {
    const idsToUpdate: string[] = [];

    // 找到所有匹配的 ID
    this.rainSystems.forEach((_, id) => {
      if (id === baseId || id.startsWith(`${baseId}_`)) {
        idsToUpdate.push(id);
      }
    });

    // 更新所有匹配的效果
    idsToUpdate.forEach((id) => {
      this.updateRainConfig(id, config);
    });
  }

  /**
   * 移除降雨效果
   */
  removeRain(id: string): void {
    const rainSystem = this.rainSystems.get(id);
    if (rainSystem) {
      this.world.scene.remove(rainSystem);
      rainSystem.geometry.dispose();
      (rainSystem.material as PointsMaterial).dispose();
      this.rainSystems.delete(id);
      this.velocities.delete(id);
      this.regionBounds.delete(id);
      this.regionCoordinates.delete(id);
    }
  }

  /**
   * 更新降雨配置
   */
  updateRainConfig(id: string, config: Partial<RainConfig>): void {
    const rainSystem = this.rainSystems.get(id);
    if (!rainSystem) return;

    const material = rainSystem.material as PointsMaterial;

    if (config.particleSize !== undefined) {
      material.size = config.particleSize;
    }
    if (config.opacity !== undefined) {
      material.opacity = config.opacity;
    }
    if (config.color !== undefined) {
      // 由于vertexColors: true，需要更新几何体的颜色属性
      const colorAttribute = rainSystem.geometry.getAttribute("color");
      if (colorAttribute) {
        const colorObj = new Color(config.color);
        const hsl: any = {};
        colorObj.getHSL(hsl);

        // 更新每个粒子的颜色，保持亮度变化
        for (let i = 0; i < colorAttribute.count; i++) {
          const lightness = hsl.l * (0.8 + Math.random() * 0.2);
          const newColor = new Color();
          newColor.setHSL(hsl.h, hsl.s, lightness);

          colorAttribute.setXYZ(i, newColor.r, newColor.g, newColor.b);
        }

        colorAttribute.needsUpdate = true;
      }
    }
    if (config.renderOrder !== undefined) {
      rainSystem.renderOrder = config.renderOrder;
    }

    // 更新降雨速度
    if (config.rainSpeed !== undefined) {
      const velocities = this.velocities.get(id);
      if (velocities) {
        // 更新每个粒子的Y轴速度
        for (let i = 0; i < velocities.length / 3; i++) {
          const index = i * 3;
          // 保持原有的速度比例，只调整幅度
          const speedVariation = 0.8 + Math.random() * 0.4; // 0.8-1.2倍速度变化
          velocities[index + 1] = -config.rainSpeed * speedVariation; // Y轴向下
        }
      }
    }

    material.needsUpdate = true;
  }

  /**
   * 显示/隐藏降雨效果
   */
  setRainVisible(id: string, visible: boolean): void {
    const rainSystem = this.rainSystems.get(id);
    if (rainSystem) {
      rainSystem.visible = visible;
    }
  }

  /**
   * 获取所有降雨系统ID
   */
  getRainIds(): string[] {
    return Array.from(this.rainSystems.keys());
  }

  /**
   * 移除所有降雨效果
   */
  removeAllRain(): void {
    this.getRainIds().forEach((id) => this.removeRain(id));
  }
}
