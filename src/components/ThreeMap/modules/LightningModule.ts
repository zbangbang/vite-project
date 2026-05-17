import {
  Sprite,
  SpriteMaterial,
  TextureLoader,
  CanvasTexture,
  Vector3,
  Color,
  AdditiveBlending,
} from "three";

/**
 * 闪电配置接口
 */
export interface LightningConfig {
  /** 闪电数量 */
  lightningCount?: number;
  /** 闪电高度范围 [min, max] */
  heightRange?: [number, number];
  /** 闪电大小范围 [min, max] */
  sizeRange?: [number, number];
  /** 闪电持续时间(ms) */
  duration?: number;
  /** 闪电间隔时间(ms) */
  interval?: number;
  /** 闪电颜色 */
  color?: number;
  /** 闪电透明度 */
  opacity?: number;
  /** 纹理图片地址或纹理对象 */
  textureUrl?: string | any;
  /** 渲染顺序 */
  renderOrder?: number;
  /** 特定位置的闪电(经纬度数组) */
  specificLocations?: Array<{ lon: number; lat: number }>;
}

/**
 * 单个闪电的数据结构
 */
interface LightningData {
  sprite: Sprite;
  height: number;
  size: number;
  isFlashing: boolean;
  flashStartTime: number;
  nextFlashTime: number;
  position: Vector3; // 固定位置
  baseOpacity: number;
}

/**
 * 闪电效果模块 - 基于GeoJSON区域生成闪电效果
 */
export class LightningModule {
  private world: any;
  private lightningSystems: Map<string, LightningData[]> = new Map();
  private regionBounds: Map<
    string,
    { minX: number; maxX: number; minY: number; maxY: number }
  > = new Map();
  private regionCoordinates: Map<string, number[][]> = new Map();

  constructor(world: any) {
    this.world = world;
  }

  /**
   * 创建默认闪电纹理
   */
  private createDefaultLightningTexture(): CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 512;
    const context = canvas.getContext("2d")!;

    // 创建闪电形状的渐变
    const gradient = context.createLinearGradient(64, 0, 64, 512);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.1, "rgba(200,220,255,1)");
    gradient.addColorStop(0.3, "rgba(255,255,255,1)");
    gradient.addColorStop(0.5, "rgba(200,220,255,1)");
    gradient.addColorStop(0.7, "rgba(255,255,255,1)");
    gradient.addColorStop(0.9, "rgba(200,220,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 512);

    // 添加一些闪光效果
    context.fillStyle = "rgba(255,255,255,0.8)";
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * 512;
      context.fillRect(48, y, 32, 20);
    }

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
            console.error("闪电纹理加载失败:", error);
            reject(error);
          }
        );
      });
    }

    throw new Error("textureUrl 必须是图片URL字符串或纹理对象");
  }

  /**
   * 解析GeoJSON边界,获取区域范围
   */
  private parseGeoJSONBounds(geojson: any): {
    coordinates: number[][];
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
  } {
    const allCoordinates: number[][] = [];

    // 处理FeatureCollection
    if (geojson.type === "FeatureCollection") {
      geojson.features.forEach((feature: any) => {
        this.extractCoordinates(feature.geometry, allCoordinates);
      });
    } else if (geojson.type === "Feature") {
      this.extractCoordinates(geojson.geometry, allCoordinates);
    } else {
      // 直接是Geometry
      this.extractCoordinates(geojson, allCoordinates);
    }

    // 转换为投影坐标
    const projectedCoords: number[][] = [];
    allCoordinates.forEach((coord) => {
      const projected = this.world.geoProjection(coord);
      if (
        projected &&
        Array.isArray(projected) &&
        !isNaN(projected[0]) &&
        !isNaN(projected[1])
      ) {
        projectedCoords.push(projected);
      }
    });

    if (projectedCoords.length === 0) {
      throw new Error("无效的GeoJSON坐标,投影后没有有效点");
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
    if (!geometry) return;

    switch (geometry.type) {
      case "Point":
        coordinates.push(geometry.coordinates);
        break;
      case "MultiPoint":
      case "LineString":
        coordinates.push(...geometry.coordinates);
        break;
      case "Polygon":
        geometry.coordinates.forEach((ring: any) => {
          if (Array.isArray(ring)) {
            coordinates.push(...ring);
          }
        });
        break;
      case "MultiPolygon":
        geometry.coordinates.forEach((polygon: any) => {
          polygon.forEach((ring: any) => {
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
    }
  }

  /**
   * 判断点是否在多边形内(射线法)
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
   * 在区域内生成随机位置
   */
  private generateRandomPosition(
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
    coordinates: number[][]
  ): Vector3 | null {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const z = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);

      // 如果有坐标数据,进行多边形判断
      if (coordinates.length > 3) {
        if (this.isPointInPolygon([x, z], coordinates)) {
          return new Vector3(x, 0, z);
        }
      } else {
        return new Vector3(x, 0, z);
      }

      attempts++;
    }

    // 如果失败,使用边界内的随机位置
    return new Vector3(
      bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
      0,
      bounds.minY + Math.random() * (bounds.maxY - bounds.minY)
    );
  }

  /**
   * 创建闪电效果
   * @param id 闪电系统的唯一标识
   * @param geojson GeoJSON数据(支持FeatureCollection格式)
   * @param config 闪电配置
   */
  async createLightning(
    id: string,
    geojson: any,
    config: LightningConfig = {}
  ): Promise<void> {
    // 如果已存在相同ID的闪电系统,先移除
    if (this.lightningSystems.has(id)) {
      this.removeLightning(id);
    }

    // 默认配置
    const {
      lightningCount = 3,
      heightRange = [0.5, 2], // 降低高度范围,贴近地面
      sizeRange = [1, 2],
      duration = 200,
      interval = 3000,
      color = 0xaaddff,
      opacity = 0.9,
      textureUrl,
      renderOrder = 200,
      specificLocations = [],
    } = config;

    // 解析GeoJSON边界
    const { coordinates, bounds } = this.parseGeoJSONBounds(geojson);

    // 保存区域信息
    this.regionBounds.set(id, bounds);
    this.regionCoordinates.set(id, coordinates);

    // 加载或创建纹理
    let texture;
    if (textureUrl) {
      try {
        texture = await this.loadTexture(textureUrl);
      } catch (error) {
        console.warn("加载闪电纹理失败,使用默认纹理:", error);
        texture = this.createDefaultLightningTexture();
      }
    } else {
      console.log("未指定纹理,使用默认纹理");
      texture = this.createDefaultLightningTexture();
    }

    const lightnings: LightningData[] = [];
    const currentTime = Date.now();

    // 处理特定位置的闪电
    specificLocations.forEach((location) => {
      const projected = this.world.geoProjection([location.lon, location.lat]);
      if (projected && !isNaN(projected[0]) && !isNaN(projected[1])) {
        const position = new Vector3(projected[0], 0, projected[1]);
        const height =
          heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
        const size =
          sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);

        // 创建精灵材质
        const material = new SpriteMaterial({
          map: texture,
          color: new Color(color),
          transparent: true,
          opacity: 0,
          depthTest: true,
          depthWrite: false,
          blending: AdditiveBlending,
        });

        // 创建精灵
        const sprite = new Sprite(material);
        sprite.position.set(position.x, height, position.z);
        sprite.scale.set(size * 0.5, size * 2, 1);
        sprite.renderOrder = renderOrder;
        sprite.visible = false;

        // 添加到场景
        this.world.scene.add(sprite);

        lightnings.push({
          sprite,
          height,
          size,
          isFlashing: false,
          flashStartTime: 0,
          nextFlashTime: currentTime + Math.random() * interval,
          position: position.clone(),
          baseOpacity: opacity,
        });
      }
    });

    // 创建随机位置的闪电
    for (let i = 0; i < lightningCount; i++) {
      const position = this.generateRandomPosition(bounds, coordinates);
      if (!position) continue;

      const height =
        heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
      const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);

      // 创建精灵材质
      const material = new SpriteMaterial({
        map: texture,
        color: new Color(color),
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        blending: AdditiveBlending,
      });

      // 创建精灵
      const sprite = new Sprite(material);
      sprite.position.set(position.x, height, position.z);
      sprite.scale.set(size * 0.5, size * 2, 1);
      sprite.renderOrder = renderOrder;
      sprite.visible = false;

      // 添加到场景
      this.world.scene.add(sprite);

      lightnings.push({
        sprite,
        height,
        size,
        isFlashing: false,
        flashStartTime: 0,
        nextFlashTime: currentTime + Math.random() * interval,
        position: position.clone(),
        baseOpacity: opacity,
      });
    }

    // 保存到映射表
    this.lightningSystems.set(id, lightnings);

    // 启动闪电动画
    this.startLightningAnimation(id, duration, interval);
  }

  /**
   * 启动闪电动画
   */
  private startLightningAnimation(
    id: string,
    duration: number,
    interval: number
  ) {
    const updateHandler = (delta: number, elapsedTime: number) => {
      const lightnings = this.lightningSystems.get(id);

      if (!lightnings) {
        // 闪电系统已被移除,取消监听
        this.world.time.off("tick", updateHandler);
        return;
      }

      const currentTime = Date.now();

      lightnings.forEach((lightning) => {
        const material = lightning.sprite.material as SpriteMaterial;

        if (lightning.isFlashing) {
          // 正在闪烁
          const elapsed = currentTime - lightning.flashStartTime;

          if (elapsed < duration) {
            // 闪烁阶段 - 快速闪烁效果
            const progress = elapsed / duration;

            // 使用正弦波产生闪烁效果
            const flickerSpeed = 20; // 闪烁频率
            const flicker = Math.sin(progress * Math.PI * flickerSpeed);

            // 整体亮度衰减
            const fadeOut = 1 - Math.pow(progress, 0.5);

            material.opacity =
              lightning.baseOpacity * fadeOut * (0.5 + Math.abs(flicker) * 0.5);
            lightning.sprite.visible = material.opacity > 0.1;
          } else {
            // 闪烁结束
            lightning.isFlashing = false;
            lightning.sprite.visible = false;
            material.opacity = 0;
            // 设置下次闪烁时间
            lightning.nextFlashTime =
              currentTime + interval + Math.random() * interval * 0.5;
          }
        } else {
          // 等待下次闪烁
          if (currentTime >= lightning.nextFlashTime) {
            lightning.isFlashing = true;
            lightning.flashStartTime = currentTime;
            lightning.sprite.visible = true;
          }
        }
      });
    };

    // 注册到时间系统
    this.world.time.on("tick", updateHandler);
  }

  /**
   * 为多个区域创建闪电效果(自动处理 FeatureCollection)
   * @param baseId 基础ID,会为每个 Feature 生成 baseId_0, baseId_1 等
   * @param geojson GeoJSON数据(支持FeatureCollection格式)
   * @param config 闪电配置
   * @returns 返回所有创建的闪电系统 ID 数组
   */
  async createLightningForRegions(
    baseId: string,
    geojson: any,
    config: LightningConfig = {}
  ): Promise<string[]> {
    const createdIds: string[] = [];

    // 处理 FeatureCollection
    if (geojson.type === "FeatureCollection") {
      for (let i = 0; i < geojson.features.length; i++) {
        const feature = geojson.features[i];
        const featureId = `${baseId}_${i}`;
        try {
          await this.createLightning(featureId, feature, config);
          createdIds.push(featureId);
        } catch (error) {
          console.error(`区域 ${i + 1} 闪电效果创建失败:`, error);
        }
      }
    } else {
      // 单个 Feature 或 Geometry
      await this.createLightning(baseId, geojson, config);
      createdIds.push(baseId);
    }

    return createdIds;
  }

  /**
   * 移除指定基础ID的所有闪电效果
   * @param baseId 基础ID,会移除所有 baseId_* 格式的效果
   */
  removeLightningByBaseId(baseId: string): void {
    const idsToRemove: string[] = [];

    // 找到所有匹配的 ID
    this.lightningSystems.forEach((_, id) => {
      if (id === baseId || id.startsWith(`${baseId}_`)) {
        idsToRemove.push(id);
      }
    });

    // 移除所有匹配的效果
    idsToRemove.forEach((id) => {
      this.removeLightning(id);
    });
  }

  /**
   * 移除闪电效果
   */
  removeLightning(id: string): void {
    const lightnings = this.lightningSystems.get(id);
    if (lightnings) {
      lightnings.forEach(({ sprite }) => {
        this.world.scene.remove(sprite);
        sprite.material.dispose();
      });
      this.lightningSystems.delete(id);
      this.regionBounds.delete(id);
      this.regionCoordinates.delete(id);
    }
  }

  /**
   * 更新闪电配置
   */
  updateLightningConfig(id: string, config: Partial<LightningConfig>): void {
    const lightnings = this.lightningSystems.get(id);
    if (!lightnings) return;

    lightnings.forEach(({ sprite }) => {
      const material = sprite.material as SpriteMaterial;

      if (config.color !== undefined) {
        material.color.setHex(config.color);
      }
      if (config.opacity !== undefined) {
        // 更新基础透明度,会在闪烁时应用
        lightnings.forEach((l) => {
          l.baseOpacity = config.opacity!;
        });
      }
      if (config.sizeRange !== undefined) {
        const size =
          config.sizeRange[0] +
          Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
        sprite.scale.set(size * 0.5, size * 2, 1);
      }
      if (config.renderOrder !== undefined) {
        sprite.renderOrder = config.renderOrder;
      }

      material.needsUpdate = true;
    });
  }

  /**
   * 更新指定基础ID的所有闪电效果配置
   * @param baseId 基础ID
   * @param config 配置参数
   */
  updateLightningConfigByBaseId(
    baseId: string,
    config: Partial<LightningConfig>
  ): void {
    const idsToUpdate: string[] = [];

    // 找到所有匹配的 ID
    this.lightningSystems.forEach((_, id) => {
      if (id === baseId || id.startsWith(`${baseId}_`)) {
        idsToUpdate.push(id);
      }
    });

    // 更新所有匹配的效果
    idsToUpdate.forEach((id) => {
      this.updateLightningConfig(id, config);
    });
  }

  /**
   * 显示/隐藏闪电效果
   */
  setLightningVisible(id: string, visible: boolean): void {
    const lightnings = this.lightningSystems.get(id);
    if (lightnings) {
      lightnings.forEach(({ sprite }) => {
        sprite.visible = visible;
      });
    }
  }

  /**
   * 获取所有闪电系统ID
   */
  getLightningIds(): string[] {
    return Array.from(this.lightningSystems.keys());
  }

  /**
   * 移除所有闪电效果
   */
  removeAllLightning(): void {
    this.getLightningIds().forEach((id) => this.removeLightning(id));
  }
}
