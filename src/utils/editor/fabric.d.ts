declare namespace fabric {
  export import fabric from '@types/fabric'
  export class FImage {
    constructor(options: {
      image: fabric.Image
      id: any
      [key: any]: any
    }, alreayGrouped?: boolean);
  }
}