import * as THREE from "three"
import Experience from "./Experience.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

export default class Camera {
  constructor() {
    this.experience = new Experience()
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.debug = this.experience.debug

    this.setInstance()
    this.setControls()
  }
  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      10000
    )
    this.instance.position.set(0, 0, 10)
    this.scene.add(this.instance)
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enabled = true
    this.controls.autoRotate = false
    this.controls.enablePan = false

    if (this.debug.active) {
      const debugFolder = this.debug.ui.addFolder('Camera').close()
      const debugObject = {
        'AutoRotate': this.controls.autoRotate,
      }
      debugFolder.add(debugObject, "AutoRotate").onChange(val => {
        this.controls.autoRotate = val
      })
    }
  }
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
  update() {
    this.controls.update()
  }
}
