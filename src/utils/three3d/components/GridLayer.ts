/*
 * @Author: wanglx
 * @Date: 2025-11-10 18:40:02
 * @LastEditors: wanglx
 * @LastEditTime: 2025-11-10 20:42:57
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */

import * as THREE from "three";

/**
 * GridLayer 网格图层组件
 * 第一步：简单读取灰度图并按经纬度绘制
 */
export class GridLayer {
  public mesh!: THREE.Mesh;
  public cornerMarkers: THREE.Group = new THREE.Group(); // 角点标记组

  /**
   * 从灰度图创建网格图层 - 添加边界裁剪
   * @param imageUrl 灰度图路径
   * @param config 灰度图的经纬度范围配置
   * @param legend 图例数据
   * @param geoProjection 地理投影函数
   * @param boundaryGeoJSON 边界GeoJSON（用于裁剪）
   */
  async createFromImage(
    imageUrl: string,
    config: {
      startLat: number;
      endLat: number;
      startLon: number;
      endLon: number;
    },
    legend: Array<{ value: number; color: number[]; label?: string }>,
    geoProjection: (coords: [number, number]) => [number, number],
    boundaryGeoJSON?: any
  ): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      const group = new THREE.Group();

      loader.load(
        imageUrl,
        (dataTexture) => {
          // 创建边界遮罩纹理（如果有边界数据）
          let boundaryMask: THREE.Texture | null = null;
          if (boundaryGeoJSON && geoProjection) {
            boundaryMask = this.createBoundaryMask(
              JSON.parse(boundaryGeoJSON),
              geoProjection,
              config
            );
          }

          // 计算四个角点的投影坐标
          const topLeft = geoProjection([config.startLon, config.startLat]);
          const topRight = geoProjection([config.endLon, config.startLat]);
          const bottomLeft = geoProjection([config.startLon, config.endLat]);
          const bottomRight = geoProjection([config.endLon, config.endLat]);

          // 计算平面的尺寸和中心位置
          const width = Math.abs(topRight[0] - topLeft[0]);
          const height = Math.abs(bottomLeft[1] - topLeft[1]);
          const centerX = (topLeft[0] + topRight[0]) / 2;
          const centerY = (topLeft[1] + bottomLeft[1]) / 2;

          // 创建图例颜色纹理（1D渐变纹理）
          const legendTexture = this.createLegendTexture(legend);

          // 创建平面几何体
          const geometry = new THREE.PlaneGeometry(width, height, 128, 128);

          // 创建材质 - 使用 ShaderMaterial 实现颜色映射 + 边界裁剪
          const material = new THREE.ShaderMaterial({
            uniforms: {
              dataMap: { value: dataTexture },
              legendMap: { value: legendTexture },
              boundaryMask: { value: boundaryMask },
              useBoundaryMask: { value: boundaryMask ? 1.0 : 0.0 },
              minValue: { value: legend[0].value },
              maxValue: { value: legend[legend.length - 1].value },
            },
            vertexShader: `
              varying vec2 vUv;
              
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform sampler2D dataMap;
              uniform sampler2D legendMap;
              uniform sampler2D boundaryMask;
              uniform float useBoundaryMask;
              uniform float minValue;
              uniform float maxValue;
              varying vec2 vUv;
              
              void main() {
                // 如果启用了边界裁剪，检查当前点是否在边界内
                if (useBoundaryMask > 0.5) {
                  vec4 maskColor = texture2D(boundaryMask, vUv);
                  // 如果遮罩为黑色（边界外），丢弃像素
                  if (maskColor.r < 0.5) {
                    discard;
                  }
                }
                
                // 读取灰度图的 RGB 通道
                vec4 data = texture2D(dataMap, vUv);
                
                // 根据特殊编码方式解析数据值
                // R 通道：符号位（0 或非 0）
                // G 通道：整数部分
                // B 通道：小数部分
                float sign = data.r > 0.0 ? 1.0 : -1.0;
                float integerPart = data.g * 255.0; // 0-255
                float decimalPart = data.b * 255.0; // 0-255
                
                // 计算实际数据值：sign * (G * 10 + B / 10)
                float dataValue = sign * (integerPart * 10.0 + decimalPart / 10.0);
                
                // 调试：显示解码后的数据值范围
                // if (dataValue > 0.0) {
                //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色表示有数据
                // } else {
                //   gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); // 蓝色表示无数据
                // }
                // return;
                
                // 映射到 0-1 范围用于查找图例颜色
                float normalizedValue = (dataValue - minValue) / (maxValue - minValue);
                normalizedValue = clamp(normalizedValue, 0.0, 1.0);
                
                // 从图例纹理采样颜色
                vec4 color = texture2D(legendMap, vec2(normalizedValue, 0.5));
                
                // 如果数据值超出范围，显示为透明
                if (dataValue < minValue || dataValue > maxValue) {
                  gl_FragColor = vec4(color.rgb, 0.1);
                } else {
                  gl_FragColor = vec4(color.rgb, 0.8);
                }
              }
            `,
            transparent: true,
            side: THREE.DoubleSide,
          });

          // 创建网格
          this.mesh = new THREE.Mesh(geometry, material);
          this.mesh.position.set(centerX, -centerY, 0); // Y轴取反因为地图坐标系

          group.add(this.mesh);

          // 创建四个角点标记，暂时屏蔽，有问题再打开调试
          //   this.createCornerMarkers([
          //     {
          //       name: "左上",
          //       pos: topLeft,
          //       lonLat: [config.startLon, config.startLat],
          //     },
          //     {
          //       name: "右上",
          //       pos: topRight,
          //       lonLat: [config.endLon, config.startLat],
          //     },
          //     {
          //       name: "左下",
          //       pos: bottomLeft,
          //       lonLat: [config.startLon, config.endLat],
          //     },
          //     {
          //       name: "右下",
          //       pos: bottomRight,
          //       lonLat: [config.endLon, config.endLat],
          //     },
          //   ]);

          group.add(this.cornerMarkers);

          resolve(group);
        },
        undefined,
        (error) => {
          console.error("❌ 灰度图加载失败:", error);
          reject(error);
        }
      );
    });
  }

  /**
   * 创建图例颜色纹理（1D渐变纹理）
   */
  private createLegendTexture(
    legend: Array<{ value: number; color: number[] }>
  ): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * 4);

    const minVal = legend[0].value;
    const maxVal = legend[legend.length - 1].value;

    for (let i = 0; i < size; i++) {
      const t = i / (size - 1); // 0-1 范围
      let color = [0, 0, 0, 255];

      // 在图例中找到对应的颜色区间
      for (let j = 0; j < legend.length - 1; j++) {
        const current = legend[j];
        const next = legend[j + 1];

        const t1 = (current.value - minVal) / (maxVal - minVal);
        const t2 = (next.value - minVal) / (maxVal - minVal);

        if (t >= t1 && t <= t2) {
          // 在这个区间内插值
          const localT = (t - t1) / (t2 - t1);
          color = [
            Math.round(
              current.color[0] + (next.color[0] - current.color[0]) * localT
            ),
            Math.round(
              current.color[1] + (next.color[1] - current.color[1]) * localT
            ),
            Math.round(
              current.color[2] + (next.color[2] - current.color[2]) * localT
            ),
            255,
          ];
          break;
        }
      }

      // 如果 t 小于最小值，使用第一个颜色
      if (t < (legend[0].value - minVal) / (maxVal - minVal)) {
        color = [
          legend[0].color[0],
          legend[0].color[1],
          legend[0].color[2],
          legend[0].color[3] || 255,
        ];
      }
      // 如果 t 大于最大值，使用最后一个颜色
      if (t > (legend[legend.length - 1].value - minVal) / (maxVal - minVal)) {
        const last = legend[legend.length - 1];
        color = [
          last.color[0],
          last.color[1],
          last.color[2],
          last.color[3] || 255,
        ];
      }

      data[i * 4] = color[0];
      data[i * 4 + 1] = color[1];
      data[i * 4 + 2] = color[2];
      data[i * 4 + 3] = color[3];
    }

    const texture = new THREE.DataTexture(data, size, 1, THREE.RGBAFormat);
    texture.needsUpdate = true;

    return texture;
  }

  /**
   * 创建红色小区，用来识别色斑图范围
   */
  private createCornerMarkers(
    corners: Array<{
      name: string;
      pos: [number, number];
      lonLat: [number, number];
    }>
  ) {
    this.cornerMarkers.clear();

    corners.forEach((corner) => {
      // 创建红色小球
      const geometry = new THREE.SphereGeometry(0.05, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(geometry, material);

      sphere.position.set(corner.pos[0], -corner.pos[1], 0.5); // Z轴抬高一点，确保可见
      sphere.name = `marker_${corner.name}`;

      this.cornerMarkers.add(sphere);
    });
  }

  /**
   * 创建边界遮罩纹理（根据GeoJSON边界裁剪）
   */
  private createBoundaryMask(
    boundaryData: any,
    geoProjection: (coords: [number, number]) => [number, number],
    config: {
      startLat: number;
      endLat: number;
      startLon: number;
      endLon: number;
    }
  ): THREE.Texture {
    const canvas = document.createElement("canvas");
    const resolution = 512; // 遮罩纹理分辨率
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext("2d")!;

    // 填充黑色背景（不可见区域）
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, resolution, resolution);

    // 计算灰度图的边界范围（投影坐标）
    const topLeft = geoProjection([config.startLon, config.startLat]);
    const bottomRight = geoProjection([config.endLon, config.endLat]);
    const minX = topLeft[0];
    const maxX = bottomRight[0];
    const minY = -bottomRight[1]; // Y轴取反
    const maxY = -topLeft[1];

    console.log("📍 灰度图边界范围:", { minX, maxX, minY, maxY });

    // 处理GeoJSON数据
    let features: any[] = [];
    if (boundaryData.type === "FeatureCollection" && boundaryData.features) {
      features = boundaryData.features;
    } else if (boundaryData.type === "Feature" && boundaryData.geometry) {
      features = [boundaryData];
    } else {
      console.error("无法识别的GeoJSON结构");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, resolution, resolution);
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    // 绘制多边形（白色为可见区域）
    ctx.fillStyle = "white";

    features.forEach((feature: any, featureIndex: number) => {
      if (!feature || !feature.geometry || !feature.geometry.coordinates) {
        console.warn(`Feature ${featureIndex} 数据不完整，跳过`);
        return;
      }

      const coordinates = feature.geometry.coordinates;
      const geomType = feature.geometry.type;

      if (geomType === "Polygon") {
        coordinates.forEach((ring: any) => {
          this.drawPolygonRing(
            ctx,
            ring,
            geoProjection,
            minX,
            maxX,
            minY,
            maxY,
            resolution
          );
        });
      } else if (geomType === "MultiPolygon") {
        coordinates.forEach((polygon: any) => {
          polygon.forEach((ring: any) => {
            this.drawPolygonRing(
              ctx,
              ring,
              geoProjection,
              minX,
              maxX,
              minY,
              maxY,
              resolution
            );
          });
        });
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }

  /**
   * 绘制单个多边形环
   */
  private drawPolygonRing(
    ctx: CanvasRenderingContext2D,
    ring: any[],
    geoProjection: (coords: [number, number]) => [number, number],
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    resolution: number
  ) {
    if (ring.length === 0) return;

    ctx.beginPath();
    ring.forEach((coord: [number, number], index: number) => {
      const [x, y] = geoProjection(coord);
      const projY = -y; // Y轴取反

      // 将投影坐标转换为Canvas坐标 (0-resolution)
      // 注意：Three.js 的 PlaneGeometry UV 是左下角(0,0)到右上角(1,1)
      // Canvas 是左上角(0,0)到右下角(width,height)
      // 所以需要翻转 Y 轴
      const canvasX = ((x - minX) / (maxX - minX)) * resolution;
      const canvasY = (1 - (projY - minY) / (maxY - minY)) * resolution; // Y轴翻转

      if (index === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    });
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 显示/隐藏图层
   */
  setVisible(visible: boolean) {
    if (this.mesh) {
      this.mesh.visible = visible;
    }
    if (this.cornerMarkers) {
      this.cornerMarkers.visible = visible;
    }
  }
}
