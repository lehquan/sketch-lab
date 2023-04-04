import * as THREE from "three"
import Experience from "./Experience.js"
import { gsap } from 'gsap';
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
    // this.instance.position.set(0, 0, 10)
    this.instance.position.set(0, 100, 800)
    this.scene.add(this.instance)
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enabled = false
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
  transformCamera = () => {
    const overlay = document.getElementById('overlay')
    gsap.to(this.instance.position, {
      duration: 3,
      x: 0,
      y: 0,
      z: 400,
      ease: "Quad.easeOut",
      onUpdate: () => {
        overlay.remove()
        this.instance.updateProjectionMatrix()
      },
      onComplete: () => {
        this.controls.enabled = true
      }
    })
  }
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
  update() {
    this.controls.update()
  }
}
