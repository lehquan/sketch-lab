import * as THREE from 'three'
import Experience from './Experience'
export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setEnv()
  }
  setEnv = () => {
    // this.scene.background = new THREE.Color(0xa5c9a5)
    this.scene.add( new THREE.AmbientLight(0xffffff, 1))
  }
  update = () => {
    this.experience.update()
  }
}
