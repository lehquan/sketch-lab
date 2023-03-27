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
    // this.scene.background = new THREE.Color(0xa5c9a5)

    const texture = this.resources.items.royal_esplanade
    texture.mapping = THREE.EquirectangularReflectionMapping
    this.scene.environment = texture

    // lights
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(1.5, 1.2, 0)
    light.castShadow = true
    this.scene.add(light)

  }
}
