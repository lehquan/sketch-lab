import * as THREE from 'three'
import Experience from './Experience'
import {EVT} from '../utils/contains';

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    // debug
    if (this.debug.active) {
      // this.debugFolder = this.debug.ui.addFolder('Lights')
    }

    // Wait for resources
    this.resources.on(EVT.READY, () => {
      this.setEnv()
    });

    this.setLights()
  }
  setEnv = () => {
    // this.scene.background = new THREE.Color(0xa5c9a5)
    // this.scene.add(new THREE.GridHelper(10, 10, 0x007f7f, 0x007f7f));
  }
  setLights = () => {
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 7, 10)
    light.castShadow = true
    this.scene.add( light )
  }
}
