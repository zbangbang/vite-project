// PolarMap.ts
import { latLonToPolar } from './projection'
import * as turf from '@turf/turf'

interface Point2D {
  x: number
  y: number
}

class PolarMap {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private geoData: any

  public scale: number = 1
  public offsetX: number = 0
  public offsetY: number = 0
  private isDragging: boolean = false
  private lastX: number = 0
  private lastY: number = 0

  constructor(canvasId: string, geoJsonUrl: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')!
    this.initEvents()

    fetch(geoJsonUrl)
      .then((res) => res.json())
      .then((data) => {
        this.geoData = data
        this.draw()
      })
  }

  private initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true
      this.lastX = e.offsetX
      this.lastY = e.offsetY
      this.canvas.style.cursor = 'grabbing'
    })

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false
      this.canvas.style.cursor = 'grab'
    })

    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false
      this.canvas.style.cursor = 'grab'
    })

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.offsetX += (e.offsetX - this.lastX) / this.scale
        this.offsetY += (e.offsetY - this.lastY) / this.scale
        this.lastX = e.offsetX
        this.lastY = e.offsetY
        this.draw()
      }
    })

    this.canvas.addEventListener('wheel', (e) => {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9

      const mouseX = e.offsetX
      const mouseY = e.offsetY

      const relX = (mouseX - this.canvas.width / 2) / this.scale - this.offsetX
      const relY = (mouseY - this.canvas.height / 2) / this.scale - this.offsetY

      this.scale *= zoomFactor

      this.offsetX =
        relX * zoomFactor - (mouseX - this.canvas.width / 2) / this.scale
      this.offsetY =
        relY * zoomFactor - (mouseY - this.canvas.height / 2) / this.scale

      this.draw()
    })
  }

  private draw() {
    const { width, height } = this.canvas
    const ctx = this.ctx

    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.scale(this.scale, this.scale)
    ctx.translate(this.offsetX, this.offsetY)

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1 / this.scale

    if (this.geoData) {
      this.geoData.features.forEach((feature: any) => {
        this.drawFeature(feature)
      })
    }

    // ctx.translate(this.offsetX, this.offsetY)
    ctx.restore()
  }

  private drawFeature(feature: any) {
    const type = feature.geometry.type
    const coords = feature.geometry.coordinates

    switch (type) {
      case 'Polygon':
        this.drawPolygon(coords)
        break
      case 'MultiPolygon':
        coords.forEach((polygon: any[]) => this.drawPolygon(polygon))
        break
      case 'LineString':
        this.drawLine(coords)
        break
      default:
        console.warn('Unsupported geometry type:', type)
    }
  }

  private drawPolygon(rings: number[][][]) {
    for (const ring of rings) {
      this.ctx.beginPath()
      for (let i = 0; i < ring.length; i++) {
        const [lng, lat] = ring[i]
        const [x, y] = latLonToPolar(lat, lng)

        const screenX = x * this.scale + this.offsetX;
        const screenY = -y * this.scale + this.offsetY;
        if (i === 0) {
          this.ctx.moveTo(screenX, screenY) // Y轴翻转
        } else {
          this.ctx.lineTo(screenX, screenY)
        }
      }
      this.ctx.closePath()
      this.ctx.stroke()
    }
  }

  private drawLine(coords: number[][]) {
    this.ctx.beginPath()
    coords.forEach((point, i) => {
      const [lng, lat] = point
      const [x, y] = latLonToPolar(lat, lng)
      const screenX = x * this.scale + this.offsetX;
      const screenY = -y * this.scale + this.offsetY;
      if (i === 0) {
        this.ctx.moveTo(screenX, screenY)
      } else {
        this.ctx.lineTo(screenX, screenY)
      }
    })
    this.ctx.stroke()
  }
}

export default PolarMap
