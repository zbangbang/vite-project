import {
  Sprite,
  SpriteMaterial,
  TextureLoader,
  CanvasTexture,
  Vector3,
  Color,
} from "three";

/**
 * 云层效果配置接口
 */
export interface CloudConfig {
  /** 云的数量 */
  cloudCount?: number;
  /** 云层高度（Y轴位置） */
  cloudHeight?: number;
  /** 云的漂移速度 */
  cloudSpeed?: number;
  /** 云的大小范围 [min, max] */
  cloudScale?: [number, number];
  /** 云的透明度 (0-1) */
  opacity?: number;
  /** 云的颜色（tint） */
  color?: number;
  /** 纹理图片地址或纹理对象（可选，不传则使用默认渐变纹理） */
  textureUrl?: string | any;
  /** 渲染顺序 */
  renderOrder?: number;
}

/**
 * 单个云的数据结构
 */
interface CloudData {
  sprite: Sprite;
  velocity: Vector3;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  coordinates: number[][]; // 添加区域坐标用于边界检测
}

/**
 * 云层效果模块 - 基于GeoJSON区域生成云层Sprite效果
 */
export class CloudModule {
  private world: any;
  private cloudSystems: Map<string, CloudData[]> = new Map();

  constructor(world: any) {
    this.world = world;
  }

  /**
   * 创建默认云纹理（使用Canvas绘制径向渐变）
   */
  private createDefaultCloudTexture(): CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d")!;

    // 创建径向渐变，模拟云朵形状
    const centerX = 128;
    const centerY = 128;
    const gradient = context.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      128
    );

    gradient.addColorStop(0, "rgba(255,255,255,0.8)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.3)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    // 添加一些不规则性，模拟云的蓬松感
    for (let i = 0; i < 5; i++) {
      const offsetX = (Math.random() - 0.5) * 80;
      const offsetY = (Math.random() - 0.5) * 80;
      const radius = 40 + Math.random() * 60;

      const subGradient = context.createRadialGradient(
        centerX + offsetX,
        centerY + offsetY,
        0,
        centerX + offsetX,
        centerY + offsetY,
        radius
      );

      subGradient.addColorStop(0, "rgba(255,255,255,0.4)");
      subGradient.addColorStop(0.5, "rgba(255,255,255,0.2)");
      subGradient.addColorStop(1, "rgba(255,255,255,0)");

      context.fillStyle = subGradient;
      context.fillRect(0, 0, 256, 256);
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
            console.error("云纹理加载失败:", error);
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
   * 复用RainModule的逻辑
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
      throw new Error("无效的GeoJSON坐标，投影后没有有效点");
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
   * 创建云层效果
   * @param id 云层系统的唯一标识
   * @param geojson GeoJSON数据（支持FeatureCollection格式）
   * @param config 云层配置
   */
  async createCloud(
    id: string,
    geojson: any,
    config: CloudConfig = {}
  ): Promise<void> {
    // 如果已存在相同ID的云层系统，先移除
    if (this.cloudSystems.has(id)) {
      this.removeCloud(id);
    }

    // 默认配置
    const {
      cloudCount = 4,
      cloudHeight = 2,
      cloudSpeed = 0.001,
      cloudScale = [2, 4],
      opacity = 0.6,
      color = 0xffffff,
      textureUrl,
      renderOrder = 50,
    } = config;

    // 解析GeoJSON边界
    const { coordinates, bounds } = this.parseGeoJSONBounds(geojson);

    // 加载或创建纹理
    let texture;
    if (textureUrl) {
      try {
        texture = await this.loadTexture(textureUrl);
      } catch (error) {
        console.warn("加载云纹理失败，使用默认纹理:", error);
        texture = this.createDefaultCloudTexture();
      }
    } else {
      console.log("未指定纹理，使用默认纹理");
      texture = this.createDefaultCloudTexture();
    }

    // 创建多个云精灵
    const clouds: CloudData[] = [];

    // 计算区域中心和范围
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerZ = (bounds.minY + bounds.maxY) / 2;
    const rangeX = (bounds.maxX - bounds.minX) * 0.8; // 80%的范围,确保云在区域内
    const rangeZ = (bounds.maxY - bounds.minY) * 0.8;

    // 固定生成指定数量的云
    for (let i = 0; i < cloudCount; i++) {
      // 在区域中心附近均匀分布
      const angle = (i / cloudCount) * Math.PI * 2;
      const distance = Math.random() * 0.5; // 0-50%的半径

      const x = centerX + Math.cos(angle) * rangeX * distance;
      const z = centerZ + Math.sin(angle) * rangeZ * distance;

      // 创建精灵材质
      const material = new SpriteMaterial({
        map: texture,
        color: new Color(color),
        transparent: true,
        opacity: opacity,
        depthTest: true,
        depthWrite: false,
      });

      // 创建精灵
      const sprite = new Sprite(material);

      // 设置位置（Y轴为云层高度）
      sprite.position.set(x, cloudHeight, z);

      // 随机缩放（云的大小）
      const scale =
        cloudScale[0] + Math.random() * (cloudScale[1] - cloudScale[0]);
      sprite.scale.set(scale, scale * 0.6, 1); // 宽度稍大于高度，更自然

      // 设置渲染顺序
      sprite.renderOrder = renderOrder;

      // 添加到场景
      this.world.scene.add(sprite);

      // 非常缓慢的随机速度
      const velocity = new Vector3(
        (Math.random() - 0.5) * cloudSpeed * 2,
        0,
        (Math.random() - 0.5) * cloudSpeed * 2
      );

      clouds.push({
        sprite,
        velocity,
        bounds,
        coordinates, // 保存区域坐标用于边界检测
      });
    }

    // 保存到映射表
    this.cloudSystems.set(id, clouds);
    // 启动更新循环
    this.startCloudAnimation(id, coordinates);
  }

  /**
   * 启动云层动画
   */
  private startCloudAnimation(id: string, coordinates: number[][]) {
    const updateHandler = (delta: number, elapsedTime: number) => {
      const clouds = this.cloudSystems.get(id);

      if (!clouds) {
        // 云层系统已被移除,取消监听
        this.world.time.off("tick", updateHandler);
        return;
      }

      clouds.forEach((cloudData) => {
        const {
          sprite,
          velocity,
          bounds,
          coordinates: regionCoords,
        } = cloudData;

        // 更新位置
        sprite.position.x += velocity.x;
        sprite.position.z += velocity.z;

        // 检查是否超出区域边界
        const outOfBounds =
          sprite.position.x < bounds.minX ||
          sprite.position.x > bounds.maxX ||
          sprite.position.z < bounds.minY ||
          sprite.position.z > bounds.maxY;

        if (outOfBounds) {
          // 重置到区域内的随机位置
          let attempts = 0;
          let validPosition = false;

          while (!validPosition && attempts < 20) {
            const newX =
              bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
            const newZ =
              bounds.minY + Math.random() * (bounds.maxY - bounds.minY);

            // 如果有坐标数据,检查是否在多边形内
            if (regionCoords && regionCoords.length > 3) {
              if (this.isPointInPolygon([newX, newZ], regionCoords)) {
                sprite.position.x = newX;
                sprite.position.z = newZ;
                validPosition = true;
              }
            } else {
              sprite.position.x = newX;
              sprite.position.z = newZ;
              validPosition = true;
            }

            attempts++;
          }

          // 如果多次尝试都失败,使用边界内的位置(不检查多边形)
          if (!validPosition) {
            sprite.position.x =
              bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
            sprite.position.z =
              bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
          }
        }

        // 微小的透明度变化,模拟云的自然变化
        const material = sprite.material as SpriteMaterial;
        const baseOpacity = 0.6;
        material.opacity =
          baseOpacity +
          Math.sin(elapsedTime * 0.3 + sprite.position.x * 0.1) * 0.05;
      });
    };

    // 注册到时间系统
    this.world.time.on("tick", updateHandler);
  }

  /**
   * 为多个区域创建云层效果（自动处理 FeatureCollection）
   * @param baseId 基础ID，会为每个 Feature 生成 baseId_0, baseId_1 等
   * @param geojson GeoJSON数据（支持FeatureCollection格式）
   * @param config 云层配置
   * @returns 返回所有创建的云层系统 ID 数组
   */
  async createCloudForRegions(
    baseId: string,
    geojson: any,
    config: CloudConfig = {}
  ): Promise<string[]> {
    const createdIds: string[] = [];

    // 处理 FeatureCollection
    if (geojson.type === "FeatureCollection") {
      for (let i = 0; i < geojson.features.length; i++) {
        const feature = geojson.features[i];
        const featureId = `${baseId}_${i}`;
        try {
          await this.createCloud(featureId, feature, config);
          createdIds.push(featureId);
        } catch (error) {
          console.error(`区域 ${i + 1} 云层效果创建失败:`, error);
        }
      }
    } else {
      // 单个 Feature 或 Geometry
      await this.createCloud(baseId, geojson, config);
      createdIds.push(baseId);
    }

    return createdIds;
  }

  /**
   * 移除指定基础ID的所有云层效果
   * @param baseId 基础ID，会移除所有 baseId_* 格式的效果
   */
  removeCloudByBaseId(baseId: string): void {
    const idsToRemove: string[] = [];

    // 找到所有匹配的 ID
    this.cloudSystems.forEach((_, id) => {
      if (id === baseId || id.startsWith(`${baseId}_`)) {
        idsToRemove.push(id);
      }
    });

    // 移除所有匹配的效果
    idsToRemove.forEach((id) => {
      this.removeCloud(id);
    });
  }

  /**
   * 更新指定基础ID的所有云层效果配置
   * @param baseId 基础ID
   * @param config 配置参数
   */
  updateCloudConfigByBaseId(
    baseId: string,
    config: Partial<CloudConfig>
  ): void {
    const idsToUpdate: string[] = [];

    // 找到所有匹配的 ID
    this.cloudSystems.forEach((_, id) => {
      if (id === baseId || id.startsWith(`${baseId}_`)) {
        idsToUpdate.push(id);
      }
    });

    // 更新所有匹配的效果
    idsToUpdate.forEach((id) => {
      this.updateCloudConfig(id, config);
    });
  }

  /**
   * 移除云层效果
   */
  removeCloud(id: string): void {
    const clouds = this.cloudSystems.get(id);
    if (clouds) {
      clouds.forEach(({ sprite }) => {
        this.world.scene.remove(sprite);
        sprite.material.dispose();
      });
      this.cloudSystems.delete(id);
    }
  }

  /**
   * 更新云层配置
   */
  updateCloudConfig(id: string, config: Partial<CloudConfig>): void {
    const clouds = this.cloudSystems.get(id);
    if (!clouds) return;

    clouds.forEach(({ sprite, velocity }) => {
      const material = sprite.material as SpriteMaterial;

      if (config.opacity !== undefined) {
        material.opacity = config.opacity;
      }
      if (config.color !== undefined) {
        material.color.setHex(config.color);
      }
      if (config.cloudScale !== undefined) {
        const scale =
          config.cloudScale[0] +
          Math.random() * (config.cloudScale[1] - config.cloudScale[0]);
        sprite.scale.set(scale, scale * 0.6, 1);
      }
      if (config.cloudSpeed !== undefined) {
        velocity.set(
          (Math.random() - 0.5) * config.cloudSpeed * 2,
          0,
          (Math.random() - 0.5) * config.cloudSpeed * 2
        );
      }
      if (config.cloudHeight !== undefined) {
        sprite.position.y = config.cloudHeight;
      }
      if (config.renderOrder !== undefined) {
        sprite.renderOrder = config.renderOrder;
      }

      material.needsUpdate = true;
    });
  }

  /**
   * 显示/隐藏云层效果
   */
  setCloudVisible(id: string, visible: boolean): void {
    const clouds = this.cloudSystems.get(id);
    if (clouds) {
      clouds.forEach(({ sprite }) => {
        sprite.visible = visible;
      });
    }
  }

  /**
   * 获取所有云层系统ID
   */
  getCloudIds(): string[] {
    return Array.from(this.cloudSystems.keys());
  }

  /**
   * 移除所有云层效果
   */
  removeAllClouds(): void {
    this.getCloudIds().forEach((id) => this.removeCloud(id));
  }
}
