import { Directive, DirectiveBinding, VNode } from 'vue'

const draggable: Directive = {
  created: () => {
    console.log('created')
  },
  beforeMount: () => {
    console.log('beforeMount')
  },
  mounted: (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) => {
    console.log('mounted', el, binding, vnode)

    const mouseDown = (e: MouseEvent) => {
      let X = e.clientX - el.offsetLeft
      let Y = e.clientY - el.offsetTop
      console.log(e)

      const mouseMove = (moveEvent: MouseEvent) => {
        console.log(moveEvent, 'moveEvent')
        el.style.left = moveEvent.clientX - X + 'px'
        el.style.top = moveEvent.clientY - Y + 'px'
      }
      document.addEventListener('mousemove', mouseMove)

      document.addEventListener('mouseup', (upEvent: MouseEvent) => {
        document.removeEventListener('mousemove', mouseMove)
      })
    }
    el.addEventListener('mousedown', mouseDown)
  },
  beforeUpdate: () => {
    console.log('beforeUpdate')
  },
  updated: () => {
    console.log('updated')
  },
  beforeUnmount: () => {
    console.log('beforeUnmount')
  },
  unmounted: () => {
    console.log('unmounted')
  }
}

export default draggable
