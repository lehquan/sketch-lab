import * as THREE from "three"
import Experience from "./Experience.js"
export default class Renderer {
  constructor() {
    this.experience = new Experience()
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.setInstance()
  }
  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })

    // this.instance.setClearColor(0x181005)
    // this.instance.useLegacyLights = true
    this.instance.outputEncoding = THREE.sRGBEncoding
    this.instance.toneMapping = THREE.NoToneMapping
    this.instance.toneMappingExposure = 1

    if (this.instance.capabilities.isWebGL2 === false && this.instance.extensions.has('ANGLE_instanced_arrays') === false) {
      return;
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
