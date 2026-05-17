import { CSS3DObject, CSS3DSprite, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js'
import { uuid } from '../utils'

interface Label3dContext {
  scene: any
  camera: any
  time: any
  sizes: any
  canvas: HTMLCanvasElement
}

export class Label3d {
  scene: any
  camera: any
  time: any
  sizes: any
  canvas: HTMLCanvasElement
  parent: any
  css3dRender: CSS3DRenderer

  constructor({ scene, camera, time, sizes, canvas }: Label3dContext) {
    this.scene = scene
    this.camera = camera
    this.time = time
    this.sizes = sizes
    this.canvas = canvas
    this.parent = null
    let { width, height } = this.sizes
    let css3dRender = new CSS3DRenderer()
    this.css3dRender = css3dRender
    css3dRender.setSize(width, height)
    css3dRender.domElement.style.position = 'absolute'
    css3dRender.domElement.style.left = '0px'
    css3dRender.domElement.style.top = '0px'
    css3dRender.domElement.style.pointerEvents = 'none'
    css3dRender.domElement.className = 'label3d-' + uuid()
    const parent = this.canvas.parentNode as HTMLElement
    if (parent) {
      parent.appendChild(css3dRender.domElement)
    }
    this.time.on('tick', () => {
      this.update()
    })
    this.sizes.on('resize', () => {
      this.resize()
    })
  }
  create(content = '', className = '', isSprite = false): any {
    let tag = document.createElement('div')
    tag.innerHTML = content
    tag.className = className
    tag.style.visibility = 'hidden'
    tag.style.position = 'absolute'
    if (!className) {
      tag.style.padding = '10px'
      tag.style.color = '#fff'
      tag.style.fontSize = '12px'
      tag.style.textAlign = 'center'
      tag.style.background = 'rgba(0,0,0,0.6)'
      tag.style.borderRadius = '4px'
    }
    let label: any = null
    if (!isSprite) {
      label = new CSS3DObject(tag)
    } else {
      label = new CSS3DSprite(tag)
    }
    label.init = (content: string, position: any) => {
      label.element.innerHTML = content
      label.element.style.visibility = 'visible'
      label.position.copy(position)
    }
    label.hide = () => {
      label.element.style.visibility = 'hidden'
    }
    label.scaleHide = () => {
      label.element.classList.add('scale-hidden')
    }
    label.show = () => {
      label.element.style.visibility = 'visible'
      label.element.classList.remove('scale-hidden')
    }
    label.setParent = (parent: any) => {
      this.parent = parent
      parent.add(label)
    }
    label.remove = () => {
      this.parent.remove(label)
    }
    return label
  }
  setLabelStyle(
    label: any,
    scale = 0.1,
    axis: any = 'x',
    axisRotation = Math.PI / 2,
    pointerEvents = 'none'
  ): void {
    label.element.style.pointerEvents = pointerEvents
    label.scale.set(scale, scale, scale)
    label.rotation[axis] = axisRotation //控制HTML标签CSS3对象角度,
  }
  // 设置层级
  setRenderLevel(zIndex: number): void {
    this.css3dRender.domElement.style.zIndex = String(zIndex)
  }
  update(): void {
    this.css3dRender.render(this.scene, this.camera.instance)
  }
  destroy(): void {
    if (this.css3dRender) {
      let domElement = this.css3dRender.domElement
      const parent = domElement.parentNode as HTMLElement
      if (parent) {
        parent.removeChild(domElement)
      }
    }
  }
  resize(): void {
    let { width, height } = this.sizes
    this.css3dRender.setSize(width, height)
  }
}
