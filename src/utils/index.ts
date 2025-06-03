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