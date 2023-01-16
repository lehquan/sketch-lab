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
    // this.scene.background = new THREE.Color(0xd6adad)
    // this.scene.add( new THREE.AmbientLight( 0xd6adad, 0.1 ) );
    // this.scene.add( new THREE.AmbientLight( 0x000000, 0.5 ) );

    const light = new THREE.SpotLight(0xffffff, 0.2, 10, Math.PI/3, 0.3)
    // light.position.set(0, 2, 2)
    light.position.set(0, 5, 2)
    light.target.position.set(0, 0, 0)

    light.castShadow = true
    light.shadow.camera.near = 0.1
    light.shadow.camera.far = 9
    light.shadow.bias = -.001
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    this.scene.add(light)
  }
  update = () => {}
}
