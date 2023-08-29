import Experience from "./Experience.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import {PerspectiveCamera} from 'three';

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
    this.instance = new PerspectiveCamera(
      60,
      this.sizes.width / this.sizes.height,
      0.01,
      10000
    )
    // this.instance.position.set(0, -1, -0.05)
    // this.instance.position.set(0, -2.5, -0.5)
    this.instance.position.set(0, -3, -1)
    // this.instance.position.set(0, -2, -0.5)
    this.scene.add(this.instance)
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enabled = true
    this.controls.autoRotate = false
    this.controls.maxDistance = 5

    // if (this.debug.active) {
    //   this.debugFolder = this.debug.ui.addFolder('Camera')
    //   const debugObject = {
    //     'Rotate': this.controls.autoRotate,
    //   };
    //   this.debugFolder.add(debugObject, "Rotate").onChange(val => {
    //     this.controls.autoRotate = val
    //   });
    // }
  }
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
  update() {
    this.controls.update()
  }
}
