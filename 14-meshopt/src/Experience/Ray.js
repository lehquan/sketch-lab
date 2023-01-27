import * as THREE from 'three'
import EventEmitter from '../utils/EventEmitter'

export default class Ray extends EventEmitter {
  constructor(camera, scene) {
    super()

    this.camera = camera.instance
    this.scene = scene
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.target = this.scene

    window.addEventListener('click', ev => {
      this.onClickHandler(ev)
      this.trigger('click')
    })
  }
  setTarget = object => {
    this.target = object
  }
  onClickHandler = ev => {
    ev.preventDefault()

    this.pointer.x = ( ev.clientX / window.innerWidth ) * 2 - 1
    this.pointer.y = - ( ev.clientY / window.innerHeight ) * 2 + 1

    this.raycaster.setFromCamera(this.pointer, this.camera)
    const intersects = this.raycaster.intersectObjects(this.target.children, true)
    console.log(intersects)

    // if (intersects.length > 0) {
    //   const INTERSECTED = intersects[0].object
    //   window.dispatchEvent(new CustomEvent(EVT.RAY_INTERSECTED, { detail: INTERSECTED}))
    // }
  }
}
