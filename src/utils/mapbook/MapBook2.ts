import { Projection } from "./Projection"
import { Tile } from "./Tile"
import { animate } from 'animejs'

export interface IMapBookOptions {
  center: [number, number]
  zoom: number
  minZoom: number
  maxZoom: number
}
const defaultOptions: IMapBookOptions = {
  center: [120.148732, 30.231006],
  zoom: 17,
  minZoom: 1,
  maxZoom: 18
}
export default class MapBook {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  options: IMapBookOptions

  tileCache: Map<string, Tile> = new Map()
  currentTileCache: Map<string, Tile> = new Map()
  private mouseDown: boolean = false
  private scale: number = 1
  private scaleTemp: number = 1
  private animate: any
  private lastZoom: number = -1
  private zoom: number = -1

  constructor(canvas: HTMLCanvasElement, options: Partial<IMapBookOptions>) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.options = Object.assign(defaultOptions, options)
    this.zoom = Math.floor(this.options.zoom)
    this.initMap()
    this.initEvent()
  }

  private initMap() {
    // 移动画布原点到画布中间
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.loadTile()
  }

  private loadTile() {
    const { tx, ty } = Projection.LatlonToTileXY(...this.options.center, this.zoom)
    let centerTilePos = [tx * 256, ty * 256]
    let centerPos = Projection.LatlonToPixelXY(...this.options.center, this.zoom)
    let offset = [
      centerPos.px - centerTilePos[0],
      centerPos.py - centerTilePos[1],
    ]
    const minx = Math.ceil((this.canvas.width / 2 - offset[0]) / 256)
    const maxx = Math.ceil((this.canvas.width / 2 - (256 - offset[0])) / 256)
    const miny = Math.ceil((this.canvas.height / 2 - offset[1]) / 256)
    const maxy = Math.ceil((this.canvas.height / 2 - (256 - offset[1])) / 256)
    this.currentTileCache.clear()

    let row, col, x, y, cacheKey
    for (let i = -minx; i <= maxx; i++) {
      for (let j = -miny; j <= maxy; j++) {
        row = tx + i
        col = ty + j
        x = i * 256 - offset[0]
        y = j * 256 - offset[1]

        cacheKey = `${row}_${col}_${this.zoom}`

        if (this.tileCache.has(cacheKey)) {
          this.tileCache.get(cacheKey)?.updatePos(x, y).render()
        } else {
          this.tileCache.set(cacheKey, new Tile({
            row,
            col,
            x,
            y,
            zoom: this.zoom,
            ctx: this.ctx
          }))
        }

        this.currentTileCache.set(cacheKey, this.tileCache.get(cacheKey)!)
      }
    }

    console.log(this.tileCache.size);
  }

  clear() {
    this.ctx.clearRect(-this.canvas.width, -this.canvas.height, this.canvas.width * 2, this.canvas.height * 2)
  }

  private initEvent() {
    this.canvas.onmousedown = e => {
      this.mouseDown = true
    }

    this.canvas.onmousemove = e => {
      if (!this.mouseDown) return

      let resolution = Projection.getResolution(this.zoom)
      let mx = e.movementX * resolution
      let my = -e.movementY * resolution

      let { x, y } = Projection.LatLonToMeterXY(...this.options.center)

      let center = Projection.MetersToLatlon(x - mx, y - my)
      this.options.center = [center.lon, center.lat]

      this.clear()
      this.loadTile()
    }

    this.canvas.onmouseup = e => {
      this.mouseDown = false
    }

    this.canvas.onwheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        if (this.options.zoom > this.options.minZoom) {
          this.options.zoom -= 0.1
        }
      } else {
        if (this.options.zoom < this.options.maxZoom) {
          this.options.zoom += 0.1
        }
      }

      this.zoom = Math.floor(this.options.zoom)
      this.scale = Math.pow(2, this.options.zoom - this.zoom)

      console.log(this.options.zoom - this.zoom);

      if (this.options.zoom - this.zoom > 0.95) {
        this.clear()
        this.loadTile()
        this.scale = Math.pow(2, this.options.zoom - this.zoom - 1)
      }

      this.ctx.save()
      this.clear()
      this.ctx.scale(this.scale, this.scale)
      // 刷新当前画布上的瓦片
      this.currentTileCache.forEach((tile) => {
        tile.render()
      })
      this.ctx.restore()
      // const dumy = { value: this.scaleTemp }
      // if (this.animate) {
      //   this.animate.cancel()
      //   this.animate = null
      // }
      // this.animate = animate(dumy, {
      //   value: [this.scaleTemp, this.scale],
      //   duration: 200,
      //   onUpdate: () => {
      //     console.log(dumy.value)
      //     // this.scaleTemp = dumy.value
      //     // this.ctx.save()
      //     // this.clear()
      //     // this.ctx.scale(dumy.value, dumy.value)
      //     // // 刷新当前画布上的瓦片
      //     // this.currentTileCache.forEach((tile) => {
      //     //   tile.render()
      //     // })
      //     // // 恢复到画布之前状态
      //     // this.ctx.restore()
      //   },
      //   onComplete: () => {
      //     this.scale = 1
      //     this.scaleTemp = 1

      //     if (this.options.zoom - this.zoom > 0.9) {
      //       this.zoom = Math.round(this.options.zoom)
      //       this.clear()
      //       this.loadTile()
      //     } else {
      //       this.clear()
      //       this.ctx.scale(dumy.value, dumy.value)
      //       // 刷新当前画布上的瓦片
      //       this.currentTileCache.forEach((tile) => {
      //         tile.render()
      //       })
      //     }

      //     // this.clear()
      //     // this.loadTile()

      //   }
      // })
    }
  }
}