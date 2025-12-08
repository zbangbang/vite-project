/**
 * 获取随机数
 *
 * @export
 * @param {number} minNum
 * @param {number} maxNum
 * @returns
 */
export function randomNum(minNum: number, maxNum: number) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1 + "", 10);
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum + "", 10);
    default:
      return 0;
  }
}

/**
   * @Date: 2023-08-02 19:47:21
   * @Description: 加载图片
   * @param {string} url
   * @return {*}
   */
export function loadImage(url: string, type: 'image' | 'svg' = 'image', flipY: boolean = true) {
  return new Promise(
    (resolve: (img: ImageBitmap | HTMLElement | null) => void) => {
      fetch(url).then((res) => {
        res.blob().then((blob) => {
          let params: any = {}
          if (flipY) {
            params.imageOrientation = 'flipY'
          }
          createImageBitmap(blob, params).then((imgBitmap) => {
            resolve(imgBitmap)
          })
        })
      })
    }
  )
}

/**
   * @Date: 2023-08-02 19:46:36
   * @Description: 加载图片，得到 imageData
   * @param {string} urlArr
   * @return {*}
   */
export async function loadImageArr(
  urlArr: string[],
  type: 'image' | 'svg' = 'image'
) {
  let imageArr: ImageBitmap[] = []

  for (let i = 0, len = urlArr.length; i < len; i++) {
    await loadImage(urlArr[i], type)
      .then((imgBitmap) => {
        imageArr.push(imgBitmap as ImageBitmap)
      })
      .catch((url) => {
        console.warn(url + ' 图片加载失败!')
      })
  }
  return imageArr
}