import * as THREE from "three"
import Experience from "./Experience.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

export default class Camera {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    
    this.params = {
      fov: 20,
      near: 0.1,
      far: 10000
    }

    this.setInstance()
    this.setControls()
  }
  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      this.params.fov,
      this.sizes.width / this.sizes.height,
      this.params.near,
      this.params.far
    )
    this.instance.position.set(0, 0, 8);
    this.scene.add(this.instance)
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enabled = true
    this.controls.maxDistance = 10
    this.controls.minDistance = 5
    this.controls.autoRotate = false
  }
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
  update() {
    this.controls.update()
  }
}
