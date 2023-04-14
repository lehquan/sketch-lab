import * as THREE from 'three'
import Experience from '../Experience';

export default class PlaneToy {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.setPlaneToy()
  }
  setPlaneToy = () => {
    const geometry = new THREE.PlaneGeometry(1, 1, )
    const material = new THREE.MeshBasicMaterial()
    const plane = new THREE.Mesh(geometry, material)

    plane.scale.setScalar(10)
    this.scene.add(plane)
  }
  update = () => {}
}
