import * as THREE from 'three'

import Experience from './Experience'
export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.setEnv()
  }
  setEnv = () => {
    // this.scene.background = new THREE.Color(0xefd1b5) // for terrain
    this.scene.background = new THREE.Color(0x000000)

    // lights
    this.scene.add( new THREE.AmbientLight( 0xffffff, 1));
  }
  update = () => {}
}
