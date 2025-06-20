import { latLonToPolar } from './projection'

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
    const canvas = this.canvas

    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true
      this.lastX = e.offsetX
      this.lastY = e.offsetY
      canvas.style.cursor = 'grabbing'
    })

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false
      canvas.style.cursor = 'grab'
    })

    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false
      canvas.style.cursor = 'grab'
    })

    canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = (e.offsetX - this.lastX) / this.scale
        const dy = (e.offsetY - this.lastY) / this.scale
        this.offsetX += dx
        this.offsetY += dy
        this.lastX = e.offsetX
        this.lastY = e.offsetY
        this.draw()
      }
    })

    canvas.addEventListener('wheel', (e) => {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9

      const mouseX = e.offsetX
      const mouseY = e.offsetY

      const relX = (mouseX - canvas.width / 2) / this.scale - this.offsetX
      const relY = (mouseY - canvas.height / 2) / this.scale - this.offsetY

      this.scale *= zoomFactor

      this.offsetX =
        relX * zoomFactor - (mouseX - canvas.width / 2) / this.scale
      this.offsetY =
        relY * zoomFactor - (mouseY - canvas.height / 2) / this.scale

      this.draw()
    })
  }

  private draw() {
    const { width, height } = this.canvas
    const ctx = this.ctx

    ctx.clearRect(0, 0, width, height)
    ctx.save()

    // 固定原点为画布中心，然后应用缩放和平移
    ctx.setTransform(1, 0, 0, 1, width / 2, height / 2)
    ctx.scale(this.scale, this.scale)
    ctx.translate(this.offsetX, this.offsetY)

    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1 / this.scale

    if (this.geoData) {
      this.geoData.features.forEach((feature: any) => {
        this.drawFeature(feature)
      })
    }

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
        let [polarX, polarY] = latLonToPolar(lat, lng)
        if (i === 0) {
          this.ctx.moveTo(polarX, -polarY)
        } else {
          this.ctx.lineTo(polarX, -polarY)
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
      let [polarX, polarY] = latLonToPolar(lat, lng)
      if (i === 0) {
        this.ctx.moveTo(polarX, -polarY)
      } else {
        this.ctx.lineTo(polarX, -polarY)
      }
    })
    this.ctx.stroke()
  }
}

export default PolarMap
