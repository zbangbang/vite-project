import { Color, PostProcessStage, Viewer } from "cesium";

/**
 * @param undefined无 1雾 2雨 3雪
 */
type weatherStatus = undefined | 1 | 2 | 3

export default class Weather {
  private viewer: Viewer

  constructor(viewer: Viewer) {
    this.viewer = viewer
  }

  private status: weatherStatus
  private fogStage: PostProcessStage | null = null
  private rainStage: PostProcessStage | null = null
  private snowStage: PostProcessStage | null = null

  /**
   * @name fog
   * @description 全屏雾
   * @param {number} visibility 透明度
   * @param {Color} fogColor 颜色
   */
  public fog(visibility: number, fogColor: Color = new Color(0.8, 0.8, 0.8, 0.5)) {
    if (this.fogStage && this.viewer.scene.postProcessStages.contains(this.fogStage)) {
      return
    }
    this.fogStage = new PostProcessStage(
      {
        name: 'fog',
        fragmentShader: `
          uniform sampler2D colorTexture;
          uniform sampler2D depthTexture;
          uniform float visibility;
          uniform vec4 fogColor;
          varying vec2 v_textureCoordinates;
          void main(void)
          {
            vec4 origcolor = texture2D(colorTexture, v_textureCoordinates);
            float depth = czm_readDepth(depthTexture, v_textureCoordinates);
            vec4 depthcolor = texture2D(depthTexture, v_textureCoordinates);
            float f = visibility * (depthcolor.r - 0.3) / 0.2;
            if (f < 0.0) f = 0.0;
            else if (f > 1.0) f = 1.0;
            gl_FragColor = mix(origcolor, fogColor, f);
          }
        `,
        uniforms: { visibility, fogColor }
      }
    )

    this.viewer.postProcessStages.add(this.fogStage)
  }

  /**
   * @name rain
   * @description 雨
   * @param {number} tiltAngle 倾斜角度
   * @param {number} rainSize 大小
   * @param {number} rainSpeed 速度
   */
  public rain(tiltAngle: number = -0.6, rainSize: number = 0.3, rainSpeed: number = 60.0) {
    if (this.rainStage && this.viewer.scene.postProcessStages.contains(this.rainStage)) {
      return
    }
    this.rainStage = new PostProcessStage({
      name: 'rain',
      fragmentShader: `
        uniform sampler2D colorTexture;
        varying vec2 v_textureCoordinates;
        uniform float tiltAngle;
        uniform float rainSize;
        uniform float rainSpeed;
        float hash(float x) {
          return fract(sin(x * 133.3) * 13.13);
        }
        void main(void) {
          float time = czm_frameNumber / rainSpeed;
          vec2 resolution = czm_viewport.zw;
          vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);
          vec3 c = vec3(.6, .7, .8);
          float a = tiltAngle;
          float si = sin(a), co = cos(a);
          uv *= mat2(co, -si, si, co);
          uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.;
          float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);
          float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;
          c *= v * b;
          gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c, 1), .5);
        }
      `,
      uniforms: { tiltAngle, rainSize, rainSpeed }
    })

    this.viewer.postProcessStages.add(this.rainStage)
  }

  /**
   * @name snow
   * @description 雪
   * @param {number} visibility 可见度
   * @param {Color} fogColor 颜色
   */
  public snow(snowSize: number = 0.02, snowSpeed: number = 60.0) {
    if (this.snowStage && this.viewer.scene.postProcessStages.contains(this.snowStage)) {
      return
    }
    this.snowStage = new PostProcessStage({
      name: 'snow',
      fragmentShader: `
        uniform sampler2D colorTexture;
        varying vec2 v_textureCoordinates;
        uniform float snowSpeed;
        uniform float snowSize;
        float snow(vec2 uv,float scale)
        {
          float time=czm_frameNumber/snowSpeed;
          float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;
          uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;
          uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;
          p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);
          k=smoothstep(0.,k,sin(f.x+f.y)*snowSize);
          return k*w;
        }
        void main(void){
          vec2 resolution=czm_viewport.zw;
          vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
          vec3 finalColor=vec3(0);
          //float c=smoothstep(1.,0.3,clamp(uv.y*.3+.8,0.,.75));
          float c=0.;
          c+=snow(uv,30.)*.0;
          c+=snow(uv,20.)*.0;
          c+=snow(uv,15.)*.0;
          c+=snow(uv,10.);
          c+=snow(uv,8.);
          c+=snow(uv,6.);
          c+=snow(uv,5.);
          finalColor=(vec3(c));
          gl_FragColor=mix(texture2D(colorTexture,v_textureCoordinates),vec4(finalColor,1),.5);
        }
      `,
      uniforms: { snowSize, snowSpeed }
    })

    this.viewer.postProcessStages.add(this.snowStage)
  }

  /**
   * @name remove
   * @description 删除对应后处理
   * @param status 1雾 2雨 3雪
   */
  public remove(status: weatherStatus) {
    switch (status) {
      case 1:
        if (this.fogStage && this.viewer.scene.postProcessStages.contains(this.fogStage)) {
          this.viewer.scene.postProcessStages.remove(this.fogStage);
        }
        break;
      case 2:
        if (this.rainStage && this.viewer.scene.postProcessStages.contains(this.rainStage)) {
          this.viewer.scene.postProcessStages.remove(this.rainStage);
        }
        break;
      case 3:
        if (this.snowStage && this.viewer.scene.postProcessStages.contains(this.snowStage)) {
          this.viewer.scene.postProcessStages.remove(this.snowStage);
        }
        break;
    }
  }

  /**
   * @name removeAll
   * @description 删除所有相关后处理
   */
  public removeAll() {
    if (this.fogStage && this.viewer.scene.postProcessStages.contains(this.fogStage)) {
      this.viewer.scene.postProcessStages.remove(this.fogStage);
    }
    if (this.rainStage && this.viewer.scene.postProcessStages.contains(this.rainStage)) {
      this.viewer.scene.postProcessStages.remove(this.rainStage);
    }
    if (this.snowStage && this.viewer.scene.postProcessStages.contains(this.snowStage)) {
      this.viewer.scene.postProcessStages.remove(this.snowStage);
    }
  }
}