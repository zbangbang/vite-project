/*
 * @FilePath: useCesium.ts
 * @Author: @zhangl
 * @Date: 2024-01-10 10:51:56
 * @LastEditTime: 2024-09-23 16:31:33
 * @LastEditors: @zhangl
 * @Description:
 */
import { ElMessage } from 'element-plus'
import { onMounted, onUnmounted, shallowRef } from 'vue'
import * as Cesium from 'cesium'

export default function useCesium(dom: string, options: any = {}) {
  const viewer = shallowRef<Cesium.Viewer | null>(null)

  // 初始化地球
  const initCesium = async () => {
    viewer.value = new Cesium.Viewer(dom, {
      baseLayerPicker: false,
      // baseLayer: Cesium.ImageryLayer.fromProviderAsync(
      //   Cesium.TileMapServiceImageryProvider.fromUrl(
      //     Cesium.buildModuleUrl('http://10.1.108.214:8888/gis/zhgyingxiang'),
      //     {
      //       tilingScheme: new Cesium.GeographicTilingScheme(),
      //       fileExtension: "jpeg",
      //     }
      //   ),
      // ),
      // baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
      //   url:
      //     `http://10.1.108.214:8888/gis/zhgyingxiang/{z}/{y}/{x}.jpeg`,
      //   tilingScheme: new Cesium.GeographicTilingScheme(),
      // })),
      // baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
      //   url:
      //     `http://10.1.108.214:8888/gis/tiles/tiandituimg/{z}/{y}/{x}.png`,
      // })),
      infoBox: false,
      // mapProjection: new Cesium.WebMercatorProjection(),
      contextOptions: {
        webgl: {
          alpha: true,
          depth: false,
          stencil: true,
          antialias: true,
          premultipliedAlpha: true,
          preserveDrawingBuffer: true,//通过canvas.toDataURL()实现截图需要将该项设置为true
          failIfMajorPerformanceCaveat: false,
        },
        allowTextureFilterAnisotropic: true,
        requestWebgl1: true,
      },
      ...options
    })

    viewer.value?.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: `http://10.1.108.214:8888/gis/tiles/GeoQ_colors/{z}/{y}/{x}.png`,
      }),
      0
    )

    // const tms = await Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl(`http://10.1.108.214:8888/gis/zhgyingxiang`), {
    //   tilingScheme: new Cesium.GeographicTilingScheme(),
    //   fileExtension: "jpeg",
    // })
    // viewer.value?.imageryLayers.addImageryProvider(
    //   tms,
    //   0
    // )

    setDestination()

    // if (options.morph) {
    //   changeMorph(options.morph)
    // }
  }
  let GOOGLE_IMG_W: Cesium.ImageryLayer | undefined
  let GEOQ_COLORS: Cesium.ImageryLayer | undefined
  // 切换底图
  const changeMapType = () => {
    if (currentModel.value === '行政') {
      GEOQ_COLORS = viewer.value?.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url:
            import.meta.env.VITE_TILES_BASE_URL.replace(/\/+$/g, '') +
            `/GeoQ_colors/{z}/{y}/{x}.png`,
        }),
        0
      )
      viewer.value?.imageryLayers.remove(GOOGLE_IMG_W!)
    } else {
      GOOGLE_IMG_W = viewer.value?.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url:
            import.meta.env.VITE_TILES_BASE_URL.replace(/\/+$/g, '') +
            `/google_img_w/{z}/{y}/{x}.png`,
        }),
        0
      )
      viewer.value?.imageryLayers.remove(GEOQ_COLORS!)
    }
  }

  /**
   * @Date: 2023-09-11 14:49:25
   * @Description: 设置视角
   * @return {*}
   */
  const setDestination = () => {
    if (!viewer.value) {
      ElMessage.error('请先初始化地图')
      return
    }
    viewer.value?.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(105, 38, 10000000),
      // destination: Cesium.Cartesian3.fromDegrees(121.3, 90, 20000000),
      duration: 1,
    })
  }

  /**
   * @Date: 2024-01-03 17:13:57
   * @Description: 切换维度
   * @param {number} val
   * @return {*}
   */
  const changeMorph = (val: number) => {
    if (val == 2) {
      viewer.value!.scene.morphTo2D(2)
    } else {
      viewer.value!.scene.morphTo3D(2)
    }
  }

  const destroyEngine = () => {
    viewer.value = null
  }
  onMounted(() => {
    initCesium()
  })

  onUnmounted(() => {
    destroyEngine()
  })

  return { viewer, setDestination, changeMorph }
}
