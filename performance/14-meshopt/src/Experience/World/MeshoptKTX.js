import * as THREE from 'three'
import Experience from '../Experience';
import {EVT} from '../../utils/contains';

export default class MeshoptKTX {
  constructor() {
    this.experience = new Experience()
    this.ray = this.experience.ray
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources

    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()

    this.setModel()
    document.addEventListener(EVT.RAY_INTERSECTED, this.findIntersection)
    window.addEventListener(EVT.RAY_INTERSECTED, this.findIntersection)
  }
  setModel = () => {
    this.model = this.resources.items.tontu.scene
    this.model.scale.setScalar(60)
    this.model.position.set(0, -1, 0)
    this.scene.add( this.model )

    this.ray.setTarget(this.model)
  }
  findIntersection = ev => {
    console.log(ev.detail)
  }
  update = () => {}
}
