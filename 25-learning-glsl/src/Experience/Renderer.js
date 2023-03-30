import * as THREE from "three"
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
      exposure: Math.pow(0.4, 0.9),
      toneMapping: 'None',
      useLegacyLights: false,
      clearColor: 0x262626
    }
    this.guiExposure = null
    this.toneMappingOptions = {
      None: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reinhard: THREE.ReinhardToneMapping,
      Cineon: THREE.CineonToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping,
      Custom: THREE.CustomToneMapping
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

    debugFolder.add(this.params, 'useLegacyLights').onChange(val => {
      this.instance.useLegacyLights = this.params.useLegacyLights
    })
    debugFolder.close()
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })

    this.instance.setClearColor(this.params.clearColor, 1)
    this.instance.useLegacyLights = this.params.useLegacyLights
    this.instance.outputEncoding = THREE.sRGBEncoding
    this.instance.toneMapping = this.toneMappingOptions[ this.params.toneMapping ]
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
