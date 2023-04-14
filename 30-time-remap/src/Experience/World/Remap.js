import * as THREE from 'three'
import { gsap, Cubic, Bounce, Expo } from 'gsap/all'
import Experience from '../Experience'

export default class Remap {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance

    this.params = {
      STEP: 100,
      count: 1500,
      rotation: 0
    }
    this.edgesPool = []

    this.setEnv()
    this.setTimeLine()
    this.setBoxes()
  }
  setEnv = () => {
    // fog
    this.scene.fog = new THREE.Fog(0x000000, 100, 12500)

    // grid
    const grid = new THREE.GridHelper(10000, this.params.STEP, 0x444444, 0x444444)
    this.scene.add(grid)

    // camera
    this.cameraPositionTarget = new THREE.Vector3()
    this.cameraLookAtTarget = new THREE.Vector3()
  }
  setTimeLine = () => {
    this.timeline = gsap.timeline({ repeat: -1})
    // this.timeline.set(this, { rotation: 135 }, 0);
    // this.timeline.to(this, 7, { rotation: 0, ease: Cubic.easeInOut }, 0);
    this.timeline.set(this.cameraPositionTarget, { y: 0 }, 0);
    this.timeline.to(this.cameraPositionTarget, 6, { y: 400, ease: Cubic.easeInOut }, 0);
    this.timeline.set(this.cameraLookAtTarget, { y: 500 }, 0);
    this.timeline.to(this.cameraLookAtTarget, 6, { y: 0, ease: Cubic.easeInOut }, 0);
  }
  setBoxes = () => {
    // this.timeline = gsap.timeline({ repeat: -1})

    const geometry = new THREE.BoxGeometry(this.params.STEP, this.params.STEP, this.params.STEP, 1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true})
    for(let i=0; i<this.params.count; i++) {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = this.params.STEP *  Math.round(20000 * (Math.random() - 0.5) / this.params.STEP) + this.params.STEP / 2;
      mesh.position.z = this.params.STEP *  Math.round(20000 * (Math.random() - 0.5) / this.params.STEP) + this.params.STEP / 2;
      mesh.updateMatrix()
      this.scene.add(mesh)

      this.edgesPool.push(mesh)

      // set cube failing motion
      const sec = 2 * Math.random() + 3;
      this.timeline.set(mesh.position, { y: 8000 }, 0);
      this.timeline.to(mesh.position, sec, { y: this.params.STEP / 2 + 1, ease: Bounce.easeOut }, 0);
    }
    this.setTimeScale()

  }
  setTimeScale = () => {
    const totalTimeline = gsap.timeline()
    totalTimeline
    .set(this.timeline, { timeScale: 1.5})
    .to(this.timeline, 1.5, { timeScale: 0.01, ease: Expo.easeInOut }, "+=0.8")
    .to(this.timeline, 1.5, { timeScale: 1.5, ease: Expo.easeInOut }, "+=5")

  }
  update = () => {
    this.camera.position.x = 1000 * Math.cos(this.params.rotation * Math.PI / 180)
    this.camera.position.z = 1000 * Math.sin(this.params.rotation * Math.PI / 180)
    this.camera.position.y = this.cameraPositionTarget.y
    this.camera.lookAt(this.cameraLookAtTarget)
    for (let i = 0; i < this.edgesPool.length; i++) {
      this.edgesPool[i].updateMatrix()
    }
  }
}
