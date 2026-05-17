import gsap from 'gsap'

/**
 * 动画模块 - 负责创建和管理 GSAP 动画时间线
 */
export class AnimationModule {
  private world: any
  public animateTl: any

  constructor(world: any) {
    this.world = world
  }

  /**
   * 创建动画时间线
   */
  createTimeline(
    focusMapGroup: any,
    focusMapTopMaterial: any,
    focusMapSideMaterial: any,
    mapLineMaterial: any,
    otherLabel: any[],
    scatterGroup: any,
    InfoPointGroup: any,
    createInfoPointLabelLoop: () => void,
    mapPlayComplete: () => void
  ) {
    let tl = gsap.timeline({
      onComplete: () => {}
    })
    tl.pause()
    this.animateTl = tl

    tl.addLabel('focusMap', 1.5)
    tl.addLabel('focusMapOpacity', 2)
    tl.addLabel('bar', 3)

    // 相机动画 - 调整为俯视角
    tl.to(this.world.camera.instance.position, {
      duration: 2,
      x: 0.3343399413079189,
      y: 17.151806042023736,
      z: 11.05808447659278,
      ease: 'circ.out',
      onStart: () => {
        this.world.flyLineFocusGroup.visible = false
      }
    })

    // 地图组位置动画
    tl.to(
      focusMapGroup.position,
      {
        duration: 1,
        x: 0,
        y: 0,
        z: 0
      },
      'focusMap'
    )

    // 地图组缩放动画
    tl.to(
      focusMapGroup.scale,
      {
        duration: 1,
        x: 1,
        y: 1,
        z: 1,
        ease: 'circ.out',
        onComplete: () => {
          scatterGroup.visible = true
          InfoPointGroup.visible = true
          createInfoPointLabelLoop()
        }
      },
      'focusMap'
    )

    // 地图顶面材质透明度动画
    tl.to(
      focusMapTopMaterial,
      {
        duration: 1,
        opacity: 1,
        ease: 'circ.out'
      },
      'focusMapOpacity'
    )

    // 地图侧面材质透明度动画
    tl.to(
      focusMapSideMaterial,
      {
        duration: 1,
        opacity: 1,
        ease: 'circ.out',
        onComplete: () => {
          focusMapSideMaterial.transparent = false
        }
      },
      'focusMapOpacity'
    )

    // 其他标签动画
    otherLabel.map((item, index) => {
      let element = item.element.querySelector('.other-label')
      tl.to(
        element,
        {
          duration: 1,
          delay: 0.1 * index,
          translateY: 0,
          opacity: 1,
          ease: 'circ.out'
        },
        'focusMapOpacity'
      )
    })

    // 地图线条透明度动画
    tl.to(
      mapLineMaterial,
      {
        duration: 0.5,
        delay: 0.3,
        opacity: 1
      },
      'focusMapOpacity'
    )

    // 直接触发地图加载完成事件
    tl.call(
      () => {
        mapPlayComplete()
      },
      undefined,
      'focusMapOpacity+=1'
    )

    return tl
  }

  /**
   * 播放动画
   */
  play() {
    if (this.animateTl) {
      this.animateTl.play()
    }
  }

  /**
   * 暂停动画
   */
  pause() {
    if (this.animateTl) {
      this.animateTl.pause()
    }
  }
}
