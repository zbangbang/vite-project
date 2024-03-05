/**
 * @Date: 2024-02-27 15:44:42
 * @Description: 图像处理卷积内核合集
 * @return {*}
 */
export const kernelsList = [
  {
    type: 'normal',
    value: [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0
    ]
  },
  {
    type: 'gaussianBlur',
    value: [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.045
    ]
  },
  {
    type: 'gaussianBlur2',
    value: [
      1, 2, 1,
      2, 4, 2,
      1, 2, 1
    ]
  },
  {
    type: 'gaussianBlur3',
    value: [
      0, 1, 0,
      1, 1, 1,
      0, 1, 0
    ]
  },
  {
    type: 'unsharpen',
    value: [
      -1, -1, -1,
      -1, 9, -1,
      -1, -1, -1
    ]
  },
  {
    type: 'sharpness',
    value: [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]
  },
  {
    type: 'sharpen',
    value: [
      -1, -1, -1,
      -1, 16, -1,
      -1, -1, -1
    ]
  },
  {
    type: 'edgeDetect',
    value: [
      -0.125, -0.125, -0.125,
      -0.125, 1, -0.125,
      -0.125, -0.125, -0.125
    ]
  },
  {
    type: 'edgeDetect2',
    value: [
      -1, -1, -1,
      -1, 8, -1,
      -1, -1, -1
    ]
  },
  {
    type: 'edgeDetect3',
    value: [
      -5, 0, 0,
      0, 0, 0,
      0, 0, 5
    ]
  },
  {
    type: 'edgeDetect4',
    value: [
      -1, -1, -1,
      0, 0, 0,
      1, 1, 1
    ]
  },
  {
    type: 'edgeDetect5',
    value: [
      -1, -1, -1,
      2, 2, 2,
      -1, -1, -1
    ]
  },
  {
    type: 'edgeDetect6',
    value: [
      -5, -5, -5,
      -5, 39, -5,
      -5, -5, -5
    ]
  },
  {
    type: 'sobelHorizontal',
    value: [
      1, 2, 1,
      0, 0, 0,
      -1, -2, -1
    ]
  },
  {
    type: 'sobelVertical',
    value: [
      1, 0, -1,
      2, 0, -2,
      1, 0, -1
    ]
  },
  {
    type: 'previtHorizontal',
    value: [
      1, 1, 1,
      0, 0, 0,
      -1, -1, -1
    ]
  },
  {
    type: 'previtVertical',
    value: [
      1, 0, -1,
      1, 0, -1,
      1, 0, -1
    ]
  },
  {
    type: 'boxBlur',
    value: [
      0.111, 0.111, 0.111,
      0.111, 0.111, 0.111,
      0.111, 0.111, 0.111
    ]
  },
  {
    type: 'triangleBlur',
    value: [
      0.0625, 0.125, 0.0625,
      0.125, 0.25, 0.125,
      0.0625, 0.125, 0.0625
    ]
  },
  {
    type: 'emboss',
    value: [
      -2, -1, 0,
      -1, 1, 1,
      0, 1, 2
    ]
  }
]