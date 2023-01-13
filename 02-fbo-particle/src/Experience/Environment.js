import * as THREE from 'three'
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.setEnv()
    });

  }
  setEnv = () => {
    // this.scene.background = new THREE.Color(0xdde8eb)
    // this.scene.background = this.resources.items.sceneBackground
  }
  update = () => {
    this.experience.update()
  }
}
