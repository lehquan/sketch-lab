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
      50,
      this.sizes.width / this.sizes.height,
      0.1,
      10000
    )
    this.instance.position.set(3.5, 0, 3.5 );
    this.instance.lookAt(0, 0, 0)
    this.scene.add(this.instance)
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enabled = true
    this.controls.enablePan = false
    this.controls.maxDistance = 10
    this.controls.minDistance = 2
    // this.controls.minPolarAngle = 0;
    // this.controls.maxPolarAngle = Math.PI;
    // this.controls.minAzimuthAngle = -Math.PI/180* 30;
    // this.controls.maxAzimuthAngle = Math.PI/180* 30;
  }
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
  update() {
    this.controls.update()
  }
}
