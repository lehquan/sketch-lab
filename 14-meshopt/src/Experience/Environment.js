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
    const texture = this.resources.items.royal_esplanade
    texture.mapping = THREE.EquirectangularReflectionMapping
    this.scene.environment = texture
  }
  update = () => {}
}
