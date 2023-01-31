import * as THREE from 'three'
import Experience from '../Experience';

export default class VaporWave {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.clock = new THREE.Clock()
    this.params = {
      displacementScale: 0.4,
      metalness: 1,
      roughness: 0.5,
    }

    this.setPlane()
  }
  setPlane = () => {
    const geometry = new THREE.PlaneGeometry(1, 2, 24, 24)
    const material = new THREE.MeshStandardMaterial({
      map: this.resources.items.grid,
      displacementMap: this.resources.items.displacement,
      displacementScale: this.params.displacementScale,
      metalnessMap: this.resources.items.metalness,
      metalness: this.params.metalness,
      roughness: this.params.roughness
    })

    this.plane = new THREE.Mesh(geometry, material)
    this.plane.rotation.x = -Math.PI * 0.5
    this.plane.position.set(0, 0, 0.15)
    this.scene.add(this.plane)

    //
    this.plane2 = this.plane.clone()
    this.plane2.position.set(0, 0, -1.85)
    this.scene.add(this.plane2)
  }
  update = () => {
    if (this.plane) {
      this.plane.position.z = (this.clock.getElapsedTime() * 0.12) % 2
      this.plane2.position.z = ((this.clock.getElapsedTime() * 0.12) % 2) - 2;
    }
  }
}
