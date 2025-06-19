export const Earth_R = 6378137

export const Projection = {
  /**
   * @Date: 2025-06-18 14:19:35
   * @Description: 地球半径
   * @return {*}
   */
  R: Earth_R,
  /**
   * @Date: 2025-06-18 14:19:26
   * @Description: 地球周长
   * @return {*}
   */
  L: 2 * Math.PI * Earth_R,
  /**
   * @Date: 2025-06-18 14:50:13
   * @Description: 获取某一层级的分辨率
   * @param {number} zoom
   * @param {number} tileSize
   * @return {*}
   */
  getResolution(zoom: number, tileSize: number = 256) {
    return this.L / (tileSize * Math.pow(2, zoom))
  },
  /**
   * @Date: 2025-06-18 14:19:41
   * @Description: 经纬度转为米（单位）
   * @param {number} longitude
   * @param {number} latitude
   * @return {*}
   */
  LatLonToMeterXY(longitude: number, latitude: number): { x: number, y: number } {
    const halfL = this.L / 2
    const x = longitude * halfL / 180
    const temp = Math.log(Math.tan((90 + latitude) * (Math.PI / 360.0))) / (Math.PI / 180.0)
    const y = halfL * temp / 180

    return { x, y }
  },
  LatlonToPixelXY(longitude: number, latitude: number, zoom: number) {
    const { x, y } = this.LatLonToMeterXY(longitude, latitude)
    return this.MetersToPixelXY(x, y, zoom)
  },
  LatlonToTileXY(longitude: number, latitude: number, zoom: number) {
    const { px, py } = this.LatlonToPixelXY(longitude, latitude, zoom)

    return this.PixelToTileXY(px, py)
  },
  /**
   * @Date: 2025-06-18 14:31:36
   * @Description: 米转像素
   * @param {number} x
   * @param {number} y
   * @param {number} zoom
   * @param {number} tileSize
   * @return {*}
   */
  MetersToPixelXY(x: number, y: number, zoom: number, tileSize: number = 256): { px: number, py: number } {
    const halfL = this.L / 2
    const resolution = this.getResolution(zoom, tileSize)
    const px = (x + halfL) / resolution
    const py = (halfL - y) / resolution

    return { px, py }
  },
  MetersToLatlon(x: number, y: number): { lon: number, lat: number } {
    let lon = x * 180 / Math.PI / this.R
    let lat = (2 * Math.atan(Math.exp(y / this.R)) - (Math.PI / 2)) * 180 / Math.PI
    return { lon, lat }
  },
  /**
   * @Date: 2025-06-18 14:34:24
   * @Description: 像素转瓦片
   * @param {number} px
   * @param {number} py
   * @param {number} tileSize
   * @return {*}
   */
  PixelToTileXY(px: number, py: number, tileSize: number = 256): { tx: number, ty: number } {
    const tx = Math.floor(px / tileSize)
    const ty = Math.floor(py / tileSize)
    return { tx, ty }
  },
  /**
   * @Date: 2025-06-18 14:40:13
   * @Description: 经纬度转瓦片坐标
   * @param {number} longitude
   * @param {number} latitude
   * @param {number} zoom
   * @param {number} tileSize
   * @return {*}
   */
  LatlonToTileXY1(longitude: number, latitude: number, zoom: number, tileSize: number = 256): { tx: number, ty: number } {
    const tx = Math.floor(((longitude + 180) / 360) * Math.pow(2, zoom))
    // 双曲正弦函数 arsinh(x) => ln(x + (x^2 + 1)^0.5)
    const ty = Math.floor(
      ((1 -
        Math.log(
          Math.tan((latitude * Math.PI) / 180) +
          1 / Math.cos((latitude * Math.PI) / 180)
        ) /
        Math.PI) /
        2) *
      Math.pow(2, zoom)
    )

    return { tx, ty }
  }
}