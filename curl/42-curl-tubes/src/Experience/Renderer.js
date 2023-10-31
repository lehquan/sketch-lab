import {
  ACESFilmicToneMapping,
  CineonToneMapping, CustomToneMapping,
  LinearToneMapping,
  NoToneMapping,
  ReinhardToneMapping, SRGBColorSpace, WebGLRenderer,
} from 'three';
import Experience from "./Experience.js"

export default class Renderer {
  constructor() {
    this.experience = new Experience()
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.debug = this.experience.debug

    this.params = {
      exposure: 1.0,
      toneMapping: 'None',
    }
    this.guiExposure = null
    this.toneMappingOptions = {
      None: NoToneMapping,
      Linear: LinearToneMapping,
      Reinhard: ReinhardToneMapping,
      Cineon: CineonToneMapping,
      ACESFilmic: ACESFilmicToneMapping,
      Custom: CustomToneMapping
    }

    this.setInstance()
    this.setDebug()
  }

  setDebug = () => {
    if (!this.debug.active) return

    const debugFolder = this.debug.ui.addFolder("Renderer")

    debugFolder.add(this.params, 'toneMapping', Object.keys(this.toneMappingOptions)).onChange(val => {
      this.instance.toneMapping = this.toneMappingOptions[ this.params.toneMapping ]

      if(this.guiExposure) {
        this.guiExposure.destroy()
        this.guiExposure = null
      }
      // toneMappingExposure is only applied for another toneMapping
      if (this.params.toneMapping !== 'None') {
        this.guiExposure = debugFolder.add(this.params, 'exposure', 0, 2).onChange(val => {
          this.instance.toneMappingExposure = this.params.exposure
        })
      }
    })
  }

  setInstance() {
    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })

    // this.instance.setClearColor(0x262626, 1)
    this.instance.outputColorSpace = SRGBColorSpace
    this.instance.toneMapping = this.toneMappingOptions.None
    this.instance.toneMappingExposure = this.params.exposure

    this.resize()
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
  }

  update() {
    this.instance.render(this.scene, this.camera.instance)
  }
}
