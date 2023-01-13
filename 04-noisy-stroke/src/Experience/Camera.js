import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import Experience from "./Experience.js"
import { gsap } from 'gsap'
import { EVT } from '../utils/contains';

export default class Camera {
  constructor() {
    this.experience = new Experience()
    this.debug = this.experience.debug
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.points = []
    this.isScrolling = false
    this.params = {
      count: 100,
      loopTime: 10,
      tube: {
        pathSegments: 512,
        radius: 3,
        radiusSegments: 20,
        closed: false,
        scale: 20,
      },
      cameraEndPoint: {
        x: 0,
        y: 2,
        z: 0,
      }
    }

    this.setInstance()
    this.setControls()
    this.makePath()
    this.transformCamera()

    window.addEventListener(EVT.ON_WHEEL, this.onScrollHandler, false)
  }
  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      45, //30,
      this.sizes.width / this.sizes.height,
      0.01,
      10000
    )
    // this.instance.position.set(0, 0, 7); // 0 2 7
    this.instance.position.set(20, 10, 30);
    this.scene.add(this.instance)
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enabled = true
    this.controls.autoRotate = false
    this.controls.enableDamping = true
    this.controls.enableZoom = false
    this.controls.enablePan = false
  }
  makePath = () => {
    this.cameraTarget = new THREE.Object3D()
    this.lookTarget = new THREE.Object3D()

    for (let i = this.params.count; i >=0; i--) {
      let r = (i * Math.PI * 2) / this.params.count
      this.points.push(new THREE.Vector3(Math.sin(r)*8, 0, i-100))
    }
    const curve = new THREE.CatmullRomCurve3(this.points)
    const material = new THREE.MeshBasicMaterial( {
      color: 0x000000,
      wireframe: true,
      transparent: true,
      opacity: .1
    })
    const geometry = new THREE.TubeGeometry( curve, this.params.tube.pathSegments, this.params.tube.radius, this.params.tube.radiusSegments, this.params.tube.closed )
    this.path = new THREE.Mesh( geometry, material )
    this.path.position.set(0, -2, 0)
    this.scene.add( this.path )
  }
  transformCamera = () => {
    gsap.to(this.instance.position, {
      duration: 1.6,
      x: this.params.cameraEndPoint.x,
      y: this.params.cameraEndPoint.y,
      z: this.params.cameraEndPoint.z,
      ease: "power1.easeInOut",
      onUpdate: () => {
        this.instance.updateProjectionMatrix()
        this.controls.target.copy(this.instance.position)
        this.controls.update()
      },
      onComplete: () => {
        this.controls.enabled = false

        // show first target group
        window.dispatchEvent(new Event(EVT.CAMERA_ANIMATE_COMPLETED))
      }
    })
  }
  onScrollHandler = event => {
    // event.preventDefault()

    if (this.isScrolling) return

    if (event.deltaY < 0) {
      this.isScrolling = true
      window.dispatchEvent(new Event(EVT.SCROLL_UP))
    }
    else if (event.deltaY >=1 )  {
      this.isScrolling = true
      window.dispatchEvent(new Event(EVT.SCROLL_DOWN))
    }
  }
  updateCameraAlongPath = (pathProgress) => {
    const time = pathProgress // 0 ~ this.params.loopTime

    const t = Math.abs((time % this.params.loopTime) / this.params.loopTime) // 0 ~ 1
    const t2 = Math.abs(((time + 0.1)% this.params.loopTime) / this.params.loopTime)
    const t3 = Math.abs(((time + 0.101)% this.params.loopTime) / this.params.loopTime)

    const pos = this.path.geometry.parameters.path.getPointAt(t)
    const pos2 = this.path.geometry.parameters.path.getPointAt(t2)
    const pos3 = this.path.geometry.parameters.path.getPointAt(t3)

    this.instance.position.set(pos.x, pos.y+2, pos.z)
    this.cameraTarget.position.set(pos2.x, pos2.y+2, pos2.z)
    this.lookTarget.position.set(pos3.x, pos3.y+1, pos3.z)
    this.instance.lookAt(this.cameraTarget.position)
  }
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
  update() {
    this.controls.update()
  }
}
