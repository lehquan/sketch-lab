import {Mesh, MeshBasicMaterial, PlaneGeometry} from 'three';
import Experience from '../Experience';

export default class PlaneToy {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.setPlaneToy()
  }
  setPlaneToy = () => {
    const geometry = new PlaneGeometry(1, 1, )
    const material = new MeshBasicMaterial()
    const plane = new Mesh(geometry, material)

    plane.scale.setScalar(10)
    this.scene.add(plane)
  }
  update = () => {}
}
