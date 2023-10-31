import { Raycaster, Vector2 } from 'three';
import EventEmitter from '../utils/EventEmitter'
import { EVT } from '../utils/contains';

export default class Ray extends EventEmitter {
  constructor(camera, scene) {
    super()

    this.camera = camera
    this.scene = scene
    this.raycaster = new Raycaster()

    // Setting "firstHitOnly" to true means the Mesh.raycast function will use the
    // bvh "raycastFirst" function to return a result more quickly.
    // https://github.com/gkjohnson/three-mesh-bvh
    this.raycaster.firstHitOnly = true

    this.pointer = new Vector2()
    this.target = this.scene
    this.recursive = true

    window.addEventListener('touchstart', ev => {
      this.onClickHandler(ev)
      this.trigger('touchstart')
    })
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
    const intersects = this.raycaster.intersectObjects(this.target.children)
    console.log(intersects)

    // if (intersects.length > 0) {
    //   const INTERSECTED = intersects[0].object
    //   window.dispatchEvent(new CustomEvent(EVT.RAY_INTERSECTED, { detail: INTERSECTED}))
    // }
  }
}
