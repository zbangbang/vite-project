import { onMounted, shallowRef } from "vue"
import * as twgl from 'twgl.js'

export default function useWebGL(domId: string) {
  let canvas: HTMLCanvasElement | null = null
  let gl = shallowRef<WebGLRenderingContext | null>(null)

  onMounted(() => {
    canvas = document.getElementById(domId) as HTMLCanvasElement
    gl.value = canvas!.getContext('webgl')
  })

  const initShaders = (gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) => {
    const lineProgramInfo = twgl.createProgramInfo(gl, [
      vertexShaderSource,
      fragmentShaderSource,
    ])

    return lineProgramInfo
  }

  return { initShaders, gl }
}