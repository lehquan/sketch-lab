import {Raycaster, Vector2} from 'three';
import EventEmitter from '../utils/EventEmitter'
import { EVT } from '../utils/contains';

export default class Ray extends EventEmitter {
  constructor(camera, scene) {
    super()

    this.camera = camera.instance
    this.scene = scene
    this.raycaster = new Raycaster()
    this.pointer = new Vector2()
    this.target = this.scene

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
    const intersects = this.raycaster.intersectObjects(this.target.children, true)

    if (intersects.length > 0) {
      const INTERSECTED = intersects[0].object
      window.dispatchEvent(new CustomEvent(EVT.RAY_INTERSECTED, { detail: INTERSECTED}))
    }
  }
}
