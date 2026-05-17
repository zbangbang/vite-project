/*
 * @Author: wanglx
 * @Date: 2025-11-06 18:13:31
 * @LastEditors: wanglx
 * @LastEditTime: 2025-11-10 18:47:57
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import * as THREE from "three";

/**
 * Terrain 地形组件
 * 基于高度图（Heightmap）创建 3D 地形效果
 */
export class Terrain {
  public mesh!: THREE.Mesh;
  private heightData: number[][] = [];

  constructor(
    private width: number = 10,
    private height: number = 10,
    private segments: number = 128,
    private heightScale: number = 1.0
  ) {}

  /**
   * 从 PNG 高度图创建地形
   * @param heightmapUrl 高度图 PNG 路径
   * @param config 配置参数（来自 heightmap_config.json）
   * @param autoRotate 是否自动旋转到水平面（默认 false）
   */
  async createFromHeightmap(
    heightmapUrl: string,
    config?: {
      heightRange?: [number, number];
      bounds?: any;
    },
    autoRotate: boolean = false
  ): Promise<THREE.Mesh> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();

      loader.load(
        heightmapUrl,
        (texture) => {
          // 创建地形几何体
          const geometry = new THREE.PlaneGeometry(
            this.width,
            this.height,
            this.segments,
            this.segments
          );

          // 使用自定义 Shader 来控制透明度和高度
          const material = new THREE.ShaderMaterial({
            uniforms: {
              heightMap: { value: texture },
              displacementScale: { value: this.heightScale },
              minHeight: { value: 0.0 },
              maxHeight: { value: 1.0 },
            },
            vertexShader: `
              uniform sampler2D heightMap;
              uniform float displacementScale;
              varying vec2 vUv;
              varying float vHeight;
              
              void main() {
                vUv = uv;
                vec4 heightData = texture2D(heightMap, uv);
                float height = heightData.r; // 灰度值
                vHeight = height;
                
                vec3 newPosition = position;
                newPosition.z = height * displacementScale;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
              }
            `,
            fragmentShader: `
              uniform float minHeight;
              uniform float maxHeight;
              varying vec2 vUv;
              varying float vHeight;
              
              // 根据高度生成渐变颜色
              vec3 getTerrainColor(float height) {
                // 定义颜色分段：低海拔 -> 中海拔 -> 高海拔
                vec3 colorDefault = vec3(0.7, 0.7, 0.7);
                vec3 color1 = vec3(0.2, 0.4, 0.3);  // 低海拔：深绿色
                vec3 color2 = vec3(0.3, 0.5, 0.2);  // 中低海拔：草绿色
                vec3 color3 = vec3(0.5, 0.45, 0.25); // 中高海拔：土黄色
                vec3 color4 = vec3(0.4, 0.35, 0.25); // 高海拔：棕色
                vec3 color5 = vec3(0.3, 0.43, 0.21);  // 极高海拔：岩石灰色
              
                vec3 color;
                if(height < 0.05) {
                  color = mix(colorDefault, color1, height / 0.05);
                } else if (height < 0.2) {
                  // 0-20%: 低海拔
                  color = mix(color1, color2, height / 0.2);
                } else if (height < 0.4) {
                  // 20-40%: 中低海拔
                  color = mix(color2, color3, (height - 0.2) / 0.2);
                } else if (height < 0.7) {
                  // 40-70%: 中高海拔
                  color = mix(color3, color4, (height - 0.4) / 0.3);
                } else {
                  // 70-100%: 高海拔
                  color = mix(color4, color5, (height - 0.7) / 0.3);
                }
                
                return color;
              }
              
              void main() {
                // 高度小于 0.02 时完全透明（隐藏黑色区域）
                if (vHeight < 0.02) {
                  discard; // 完全丢弃该像素，不渲染
                }
                
                // 根据高度获取颜色
                vec3 color = getTerrainColor(vHeight);
                
                // 添加细微的阴影效果
                float shadow = 0.8 + vHeight * 0.2;
                color *= shadow;
                
                gl_FragColor = vec4(color, 1.0);
              }
            `,
            transparent: true,
            side: THREE.DoubleSide,
          });

          this.mesh = new THREE.Mesh(geometry, material);
          // 只有当 autoRotate 为 true 时才旋转
          if (autoRotate) {
            this.mesh.rotation.x = -Math.PI / 2;
          }
          this.mesh.receiveShadow = true;
          this.mesh.castShadow = true;

          // 提取高度数据（用于后续交互）
          this.extractHeightData(texture);

          resolve(this.mesh);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * 从高度图纹理提取高度数据
   */
  private extractHeightData(texture: THREE.Texture): void {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx || !texture.image) return;

    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    ctx.drawImage(texture.image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    this.heightData = [];
    // 注意：Shader 中 UV.y 是从下到上，但 Canvas 图像 Y 是从上到下
    // 所以需要翻转 Y 轴
    for (let y = 0; y < canvas.height; y++) {
      const flippedY = canvas.height - 1 - y; // 翻转 Y 轴
      this.heightData[flippedY] = [];
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        // 灰度值 0-255 转换为 0-1
        this.heightData[flippedY][x] = data[index] / 255;
      }
    }
  }

  /**
   * 获取指定位置的高度
   * @param x 归一化 X 坐标 (0-1)
   * @param z 归一化 Z 坐标 (0-1)
   * @returns 高度值 (0-1)
   */
  getHeightAt(x: number, z: number): number {
    if (this.heightData.length === 0) return 0;

    const col = Math.floor(x * (this.heightData[0].length - 1));
    const row = Math.floor(z * (this.heightData.length - 1));

    return this.heightData[row]?.[col] || 0;
  }

  /**
   * 更新地形材质
   */
  updateMaterial(options: {
    color?: number;
    wireframe?: boolean;
    displacementScale?: number;
    baseTexture?: THREE.Texture;
  }): void {
    const material = this.mesh.material as THREE.ShaderMaterial;

    // color 参数已由 Shader 内部的高度渐变处理，不再需要手动设置
    if (options.displacementScale !== undefined) {
      material.uniforms.displacementScale.value = options.displacementScale;
      this.heightScale = options.displacementScale;
    }
    // Shader 材质不支持 wireframe 和 baseTexture
  }

  /**
   * 添加边缘发光效果
   */
  addGlowEffect(color: number = 0x00ffff, intensity: number = 1.0): void {
    const geometry = this.mesh.geometry as THREE.PlaneGeometry;

    // 创建边缘发光 Shader
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(color) },
        intensity: { value: intensity },
        viewVector: { value: new THREE.Vector3() },
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(abs(dot(vNormal, vNormel)), 3.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        varying float intensity;
        
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, 1.0);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });

    const glowMesh = new THREE.Mesh(geometry.clone(), glowMaterial);
    glowMesh.position.copy(this.mesh.position);
    glowMesh.rotation.copy(this.mesh.rotation);
    glowMesh.scale.multiplyScalar(1.02);

    this.mesh.add(glowMesh);
  }

  /**
   * 销毁资源
   */
  dispose(): void {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose();
      }
    }
  }
}
