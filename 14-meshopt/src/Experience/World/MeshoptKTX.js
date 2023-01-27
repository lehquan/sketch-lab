import * as THREE from 'three'
import Experience from '../Experience';
import {EVT} from '../../utils/contains';

export default class MeshoptKTX {
  constructor() {
    this.experience = new Experience()
    // this.ray = this.experience.ray
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources

    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()

    this.setModel()
    // document.addEventListener('touchstart', this.onClickHandler, false);
    document.addEventListener('click', this.onClickHandler, false);
    // window.addEventListener(EVT.RAY_INTERSECTED, this.findIntersection)
  }
  setModel = () => {
    this.model = this.resources.items.tontu.scene
    // this.model.add( new THREE.AxesHelper(1))
    this.model.scale.setScalar(8)
    this.model.position.set(0, -4.5, 0)
    this.scene.add( this.model )

    // this.ray.setTarget(this.model)
  }
  onClickHandler = ev => {
    ev.preventDefault();

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    this.pointer.x = ( ev.clientX / window.innerWidth ) * 2 - 1;
    this.pointer.y = - ( ev.clientY / window.innerHeight ) * 2 + 1;

    this.findIntersection();
  }
  findIntersection = ev => {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.model.children, true)
    console.log(intersects)
  }
  update = () => {}
}
