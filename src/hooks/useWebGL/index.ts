import { onMounted, shallowRef } from "vue"

export default function useWebGL(domId: string) {
  let canvas: HTMLCanvasElement | null = null
  let gl = shallowRef<WebGLRenderingContext | null>(null)

  onMounted(() => {
    canvas = document.getElementById(domId) as HTMLCanvasElement
    gl.value = canvas!.getContext('webgl')
  })

  const initShaders = (gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) => {
    //创建顶点着色器对象
    let vertexShader: WebGLShader = gl.createShader(gl.VERTEX_SHADER)!
    //创建片元着色器对象
    let fragmentShader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER)!

    //引入顶点、片元着色器源代码
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.shaderSource(fragmentShader, fragmentShaderSource)

    //编译顶点、片元着色器
    gl.compileShader(vertexShader)
    gl.compileShader(fragmentShader)

    let vs = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)
    if (!vs) {
      console.log(gl.getShaderInfoLog(vertexShader))
      return
    }
    let fs = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)
    if (!fs) {
      console.log(gl.getShaderInfoLog(fragmentShader))
      return
    }

    //创建程序对象program
    let program: WebGLProgram = gl.createProgram()!
    //附着顶点着色器和片元着色器到program
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    //链接program
    gl.linkProgram(program)
    //使用program
    gl.useProgram(program)

    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)

    // 纠正canvas画布的宽高
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    return program
  }

  return { initShaders, gl }
}