import {
  DirectionalLight,
  AmbientLight,
  Vector3,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  Color,
  TextureLoader,
  Sprite,
  SpriteMaterial,
  AdditiveBlending,
} from "three";

/**
 * 太阳光照配置接口
 */
export interface SunConfig {
  /** 太阳光强度 */
  sunIntensity?: number;
  /** 环境光强度 */
  ambientIntensity?: number;
  /** 太阳颜色 */
  sunColor?: number;
  /** 太阳大小 */
  sunSize?: number;
  /** 太阳可见性 */
  sunVisible?: boolean;
  /** 是否启用阴影 */
  enableShadow?: boolean;
  /** 太阳距离合肥中心的距离 */
  distance?: number;
  /** 水平方位角（度，0=北，90=东，180=南，270=西） */
  azimuth?: number;
  /** 垂直仰角（度，0=水平，90=正上方） */
  elevation?: number;
  /** 纹理图片地址或纹理对象（可选，不传则使用纯色） */
  textureUrl?: string | any;
}

/**
 * 太阳光照模块 - 根据时间自动调整太阳位置和光照
 */
export class SunModule {
  private world: any;
  private sunLight: DirectionalLight | null = null;
  private ambientLight: AmbientLight | null = null;
  private sunMesh: Mesh | Sprite | null = null; // 支持球体和精灵
  private glowSprite: Sprite | null = null; // 外光晕效果
  private currentConfig: Required<SunConfig>;
  private animationId: number | null = null;

  constructor(world: any) {
    this.world = world;

    // 默认配置
    this.currentConfig = {
      sunIntensity: 3,
      ambientIntensity: 0.5,
      sunColor: 0xfff4e6,
      sunSize: 1.5,
      sunVisible: true,
      enableShadow: true,
      distance: 8, // 缩短距离到8
      azimuth: 135, // 东南方向
      elevation: 45, // 45度仰角
      textureUrl: undefined, // 默认无纹理
    };
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
            console.error("太阳纹理加载失败:", error);
            reject(error);
          }
        );
      });
    }

    // 其他情况抛出错误
    throw new Error("textureUrl 必须是图片URL字符串或纹理对象");
  }

  /**
   * 创建默认太阳纹理（径向渐变）
   */
  private createDefaultSunTexture(): any {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d")!;

    // 创建径向渐变
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

    // 中心最亮，边缘透明
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.3, "rgba(255,250,200,0.9)");
    gradient.addColorStop(0.6, "rgba(255,220,100,0.5)");
    gradient.addColorStop(0.85, "rgba(255,200,50,0.2)");
    gradient.addColorStop(1, "rgba(255,180,0,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    const texture = new TextureLoader().load(canvas.toDataURL());
    return texture;
  }

  /**
   * 创建光晕纹理（更大更柔和的渐变）
   */
  private createGlowTexture(): any {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d")!;

    // 创建更柔和的径向渐变
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

    // 从中心到边缘逐渐透明
    gradient.addColorStop(0, "rgba(255,255,255,0.3)");
    gradient.addColorStop(0.2, "rgba(255,255,200,0.2)");
    gradient.addColorStop(0.5, "rgba(255,220,100,0.1)");
    gradient.addColorStop(0.8, "rgba(255,200,50,0.03)");
    gradient.addColorStop(1, "rgba(255,180,0,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    const texture = new TextureLoader().load(canvas.toDataURL());
    return texture;
  }

  /**
   * 创建太阳光照效果
   */
  async createSun(config: SunConfig = {}): Promise<void> {
    // 合并配置
    this.currentConfig = {
      ...this.currentConfig,
      ...config,
    };

    // 移除旧的太阳
    this.removeSun();

    // 计算太阳位置
    const sunPosition = this.calculateSunPosition(
      this.currentConfig.distance,
      this.currentConfig.azimuth,
      this.currentConfig.elevation
    );

    // 创建平行光（太阳光）
    this.sunLight = new DirectionalLight(
      this.currentConfig.sunColor,
      this.currentConfig.sunIntensity
    );
    this.sunLight.position.copy(sunPosition);
    // 让光照朝向合肥中心点
    this.sunLight.target.position.set(0, 0, 0);
    this.sunLight.castShadow = this.currentConfig.enableShadow;

    // 阴影配置
    if (this.currentConfig.enableShadow) {
      this.sunLight.shadow.mapSize.width = 2048;
      this.sunLight.shadow.mapSize.height = 2048;
      this.sunLight.shadow.camera.near = 0.5;
      this.sunLight.shadow.camera.far = 100;
      this.sunLight.shadow.camera.left = -20;
      this.sunLight.shadow.camera.right = 20;
      this.sunLight.shadow.camera.top = 20;
      this.sunLight.shadow.camera.bottom = -20;
    }

    this.world.scene.add(this.sunLight);
    this.world.scene.add(this.sunLight.target); // 添加光照目标

    // 创建环境光
    this.ambientLight = new AmbientLight(
      this.currentConfig.sunColor,
      this.currentConfig.ambientIntensity
    );
    this.world.scene.add(this.ambientLight);

    // 创建太阳视觉效果（使用 Sprite 精灵获得更好的发光效果）
    if (this.currentConfig.sunVisible) {
      // 加载或创建纹理
      let texture = null;
      if (this.currentConfig.textureUrl) {
        try {
          texture = await this.loadTexture(this.currentConfig.textureUrl);
        } catch (error) {
          console.warn("加载太阳纹理失败，使用默认渐变:", error);
          texture = this.createDefaultSunTexture();
        }
      } else {
        console.log("未指定纹理，使用默认渐变");
        texture = this.createDefaultSunTexture();
      }

      // 使用 Sprite 精灵代替球体
      const sunMaterial = new SpriteMaterial({
        map: texture,
        color: this.currentConfig.sunColor,
        transparent: true,
        opacity: 1.0,
        blending: AdditiveBlending, // 发光混合模式
        depthTest: false,
      });
      this.sunMesh = new Sprite(sunMaterial);
      this.sunMesh.position.copy(sunPosition);
      this.sunMesh.scale.set(
        this.currentConfig.sunSize * 2,
        this.currentConfig.sunSize * 2,
        1
      );
      this.sunMesh.renderOrder = 999; // 确保在最上层渲染
      this.world.scene.add(this.sunMesh);

      // 添加外光晕效果（更大、更透明）
      const glowTexture = this.createGlowTexture();
      const glowMaterial = new SpriteMaterial({
        map: glowTexture,
        color: this.currentConfig.sunColor,
        transparent: true,
        opacity: 0.3,
        blending: AdditiveBlending,
        depthTest: false,
      });
      this.glowSprite = new Sprite(glowMaterial);
      this.glowSprite.position.copy(sunPosition);
      this.glowSprite.scale.set(
        this.currentConfig.sunSize * 4,
        this.currentConfig.sunSize * 4,
        1
      );
      this.glowSprite.renderOrder = 998; // 在太阳下面
      this.world.scene.add(this.glowSprite);
    }
  }

  /**
   * 根据方位角和仰角计算太阳在合肥上方的位置
   * @param distance 太阳距离合肥中心的距离
   * @param azimuth 水平方位角（度，0=北，90=东，180=南，270=西）
   * @param elevation 垂直仰角（度，0=水平，90=正上方）
   * @returns 太阳位置向量（相对于场景中心/合肥位置）
   */
  private calculateSunPosition(
    distance: number,
    azimuth: number,
    elevation: number
  ): Vector3 {
    // 合肥中心点（世界坐标系中心点为 0,0,0）
    const hefeiCenter = new Vector3(0, 0, 0);

    // 将角度转换为弧度
    const azimuthRad = (azimuth * Math.PI) / 180;
    const elevationRad = (elevation * Math.PI) / 180;

    // 计算三维坐标
    // 水平距离（在XZ平面上的投影）
    const horizontalDistance = distance * Math.cos(elevationRad);

    // X轴：东西方向（方位角90度为正东）
    const x = hefeiCenter.x + horizontalDistance * Math.sin(azimuthRad);

    // Y轴：高度（仰角控制）
    const y = hefeiCenter.y + distance * Math.sin(elevationRad);

    // Z轴：南北方向（方位角0度为正北，注意Three.js的Z轴方向）
    const z = hefeiCenter.z + horizontalDistance * Math.cos(azimuthRad);

    return new Vector3(x, y, z);
  }

  /**
   * 更新太阳配置
   */
  updateSunConfig(config: Partial<SunConfig>): void {
    if (!this.sunLight) return;

    const needsRecreate =
      config.distance !== undefined ||
      config.azimuth !== undefined ||
      config.elevation !== undefined ||
      config.sunSize !== undefined ||
      config.sunVisible !== undefined ||
      config.textureUrl !== undefined;

    // 更新配置
    this.currentConfig = {
      ...this.currentConfig,
      ...config,
    };

    if (needsRecreate) {
      // 需要重新创建（位置、大小、可见性改变）
      this.createSun(this.currentConfig);
    } else {
      // 只更新材质属性
      if (config.sunIntensity !== undefined) {
        this.sunLight.intensity = config.sunIntensity;
      }
      if (config.ambientIntensity !== undefined && this.ambientLight) {
        this.ambientLight.intensity = config.ambientIntensity;
      }
      if (config.sunColor !== undefined) {
        this.sunLight.color.setHex(config.sunColor);
        if (this.ambientLight) {
          this.ambientLight.color.setHex(config.sunColor);
        }
        if (this.sunMesh) {
          (this.sunMesh.material as SpriteMaterial).color.setHex(
            config.sunColor
          );
        }
        if (this.glowSprite) {
          (this.glowSprite.material as SpriteMaterial).color.setHex(
            config.sunColor
          );
        }
      }
      if (config.enableShadow !== undefined) {
        this.sunLight.castShadow = config.enableShadow;
      }
    }
  }

  /**
   * 移除太阳光照
   */
  removeSun(): void {
    if (this.sunLight) {
      this.world.scene.remove(this.sunLight);
      this.sunLight = null;
    }

    if (this.ambientLight) {
      this.world.scene.remove(this.ambientLight);
      this.ambientLight = null;
    }

    if (this.sunMesh) {
      this.world.scene.remove(this.sunMesh);
      if (this.sunMesh.geometry) {
        this.sunMesh.geometry.dispose();
      }
      (this.sunMesh.material as SpriteMaterial).dispose();
      this.sunMesh = null;
    }

    if (this.glowSprite) {
      this.world.scene.remove(this.glowSprite);
      (this.glowSprite.material as SpriteMaterial).dispose();
      this.glowSprite = null;
    }
  }

  /**
   * 销毁模块
   */
  dispose(): void {
    this.removeSun();
  }
}
