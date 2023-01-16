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
    // this.scene.background = new THREE.Color(0xE39469)

    const pointLight = new THREE.PointLight( 0xAA8899, 0.75 );
    pointLight.position.set( 50, - 25, 75 );
    this.scene.add( pointLight );

    this.scene.add( new THREE.HemisphereLight() );
  }
  update = () => {}
}
