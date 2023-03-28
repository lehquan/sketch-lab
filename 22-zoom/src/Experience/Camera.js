import * as THREE from "three"
import Experience from "./Experience.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

export default class Camera {
  constructor() {
    this.experience = new Experience()
    this.debug = this.experience.debug
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.setInstance()
    this.setControls()
  }
  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      10000
    )
    this.instance.position.set(0, 0, 5)
    this.scene.add(this.instance)
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.target.set(0, 0, 0)
    this.controls.enabled = true
    this.controls.enableZoom = false
    this.controls.update()

    //
    if (this.debug.active) {
      const debugFolder = this.debug.ui.addFolder('OrbitControls')
      const debugObject = {
        'zoom': this.controls.enableZoom,
      };
      debugFolder.add(debugObject, "zoom").onChange(val => {
        this.controls.enableZoom = val
      });
      debugFolder.close()
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