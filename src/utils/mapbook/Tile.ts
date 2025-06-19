export interface ITileOptions {
  ctx: CanvasRenderingContext2D
  row: number
  col: number
  zoom: number
  x: number
  y: number
}
export class Tile {
  private ctx: CanvasRenderingContext2D
  private row: number
  private col: number
  private zoom: number
  private x: number
  private y: number
  private loaded: boolean = false
  private url: string = ''
  private img: any
  cacheKey: string
  constructor(options: ITileOptions) {
    this.ctx = options.ctx
    this.row = options.row
    this.col = options.col
    this.zoom = options.zoom
    this.x = options.x
    this.y = options.y
    this.cacheKey = `${this.row}_${this.col}_${this.zoom}`

    this.createUrl()
    this.load()
  }

  private createUrl() {
    this.url = `https://webrd01.is.autonavi.com/appmaptile?x=${this.row}&y=${this.col}&z=${this.zoom}&lang=zh_cn&size=1&scale=1&style=8`
  }

  private load() {
    this.img = new Image()
    this.img.src = this.url
    this.img.onload = () => {
      this.loaded = true
      this.render()
    }
  }

  render() {
    if (!this.loaded) return

    this.ctx.drawImage(this.img, this.x, this.y)
  }

  updatePos(x: number, y: number) {
    this.x = x
    this.y = y
    return this
  }
}