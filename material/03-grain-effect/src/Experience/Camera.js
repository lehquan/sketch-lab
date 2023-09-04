import * as THREE from "three"
import { gsap } from 'gsap'
import Experience from "./Experience.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import {EVT} from '../utils/contains'

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
      1000
    )
    this.instance.position.set(-20, 20, -20)
    this.scene.add(this.instance)

    this.animate()
  }
  animate = () => {
    gsap.to(this.instance.position, {
      duration: 2.2,
      x: 4,
      y: 2,
      z: 18,
      ease: "power2.easeInOut",
      onComplete: () => {
        this.controls.enabled = true
        window.dispatchEvent(new Event(EVT.CAMERA_ANIMATE_COMPLETED))
      }
    })
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enabled = false
    this.controls.autoRotate = true

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('Camera')
      const debugObject = {
        'Rotate': this.controls.autoRotate,
      };
      this.debugFolder.add(debugObject, "Rotate").onChange(val => {
        this.controls.autoRotate = val
      });
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
