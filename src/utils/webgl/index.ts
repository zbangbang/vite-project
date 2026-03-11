import * as twgl from 'twgl.js'

function createFlattenedVertices(
  gl: WebGL2RenderingContext,
  vertices: any,
  vertsPerColor: number
) {
  let last: number
  return twgl.createBufferInfoFromArrays(
    gl,
    twgl.primitives.makeRandomVertexColors(
      twgl.primitives.deindexVertices(vertices),
      {
        vertsPerColor: vertsPerColor || 1,
        rand: function (ndx, channel) {
          if (channel === 0) {
            last = (128 + Math.random() * 128) | 0
          }
          return channel < 3 ? last : 255
        },
      }
    )
  )
}

function createFlattenedFunc(
  createVerticesFunc: Function,
  vertsPerColor: number
) {
  return function (gl: WebGL2RenderingContext, ...args: any) {
    const arrays = createVerticesFunc.apply(
      null,
      args
    )
    return createFlattenedVertices(gl, arrays, vertsPerColor)
  }
}

const flattenedPrimitives = {
  createSphereBufferInfo: createFlattenedFunc(
    twgl.primitives.createSphereVertices,
    6
  ),
  createCubeBufferInfo: createFlattenedFunc(
    twgl.primitives.createCubeVertices,
    6
  ),
}

export default flattenedPrimitives
