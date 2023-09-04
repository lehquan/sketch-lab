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

    this.toneMappingOptions = {
      None: THREE.NoToneMapping,
      Reinhard: THREE.ReinhardToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping,
    };
    this.params = {
      toneMapping: 'None',
    }
    this.setInstance()
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })

    this.instance.outputEncoding = THREE.sRGBEncoding
    this.instance.toneMapping = this.toneMappingOptions[this.params.toneMapping];
    this.instance.toneMappingExposure = 1
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap

    //
    if (this.debug.active) {
      this.debug.ui.add(this.params, 'toneMapping', Object.keys(this.toneMappingOptions)).onChange(val => {
        this.instance.toneMapping = this.toneMappingOptions[val];
        this.update()
      })
    }

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
