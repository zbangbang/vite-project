/*
 * @FilePath: linkCamera.ts
 * @Author: @zhangl
 * @Date: 2024-01-10 10:51:56
 * @LastEditTime: 2024-01-22 11:09:01
 * @LastEditors: @zhangl
 * @Description:
 */
/**
 * @Date: 2024-01-09 17:19:52
 * @Description: 联动监听
 * @private: lViewer  左屏viewer
 * @private: rViewer  右屏viewer
 * @private: viewMatrix  初始相机位置矩阵
 * @private: lr  左右屏事件响应控制，防止循环监听
 * @return {*}
 */
export default class LinkCamera {
  private lViewer: Cesium.Viewer
  private rViewer: Cesium.Viewer
  private viewMatrix: Cesium.Matrix4 = Cesium.Matrix4.IDENTITY
  private lr: boolean

  constructor(lViewer: Cesium.Viewer, rViewer: Cesium.Viewer) {
    this.lViewer = lViewer
    this.rViewer = rViewer
    this.lr = true

    if (!lViewer) {
      console.error('未传入地图一实例')
      return
    }
    if (!rViewer) {
      console.error('未传入地图二实例')
      return
    }

    this.viewMatrix = rViewer.scene.camera.viewMatrix.clone()
    this.initCanvasEvent()
    this.initLinkEvent()
  }

  /**
   * @Date: 2024-01-09 17:18:28
   * @Description: 初始化dom事件，控制响应左屏还是右屏事件
   * @return {*}
   */
  initCanvasEvent() {
    this.lViewer.canvas.onmouseenter = e => {
      this.lr = false
    }

    this.rViewer.canvas.onmouseenter = e => {
      this.lr = true
    }
  }

  /**
   * @Date: 2024-01-09 17:19:05
   * @Description: 开启左右屏监听
   * @return {*}
   */
  initLinkEvent() {
    const rpostEvent = () => {
      if (!this.lr) return
      if (Cesium.Matrix4.equalsEpsilon(this.viewMatrix, this.rViewer.scene.camera.viewMatrix, 1e-7)) return

      let pos: Cesium.Cartographic = this.rViewer.scene.camera.positionCartographic
      let lon = (pos.longitude / Math.PI) * 180
      let lat = (pos.latitude / Math.PI) * 180
      let height = pos.height
      this.lViewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
        duration: 0
      })
      this.viewMatrix = this.rViewer.camera.viewMatrix.clone()
    }
    this.rViewer.scene.postRender.addEventListener(rpostEvent)

    const lpostEvent = () => {
      if (this.lr) return
      if (Cesium.Matrix4.equalsEpsilon(this.viewMatrix, this.lViewer.scene.camera.viewMatrix, 1e-7)) return

      let pos: Cesium.Cartographic = this.lViewer.scene.camera.positionCartographic
      let lon = (pos.longitude / Math.PI) * 180
      let lat = (pos.latitude / Math.PI) * 180
      let height = pos.height
      this.rViewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
        duration: 0
      })
      this.viewMatrix = this.lViewer.camera.viewMatrix.clone()
    }
    this.lViewer.scene.postRender.addEventListener(lpostEvent)
  }
}