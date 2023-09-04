import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';

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
    this.scene.background = new THREE.Color(0x000000)

    // lights
    this.scene.add( new THREE.AmbientLight( 0xffffff, 1));

    // this.spotLight_1 = this.createSpotLight(0xFF7F00, new THREE.Vector3(15/10, 10, 45/10))
    // this.spotLight_2 = this.createSpotLight(0x00FF7F, new THREE.Vector3(0, 10, 35/10))
    // this.spotLight_3 = this.createSpotLight(0x7F00FF, new THREE.Vector3(-15/10, 10, 45/10))
    // this.scene.add(this.spotLight_1, this.spotLight_2, this.spotLight_3)
    // this.animateLight()
  }
  createSpotLight = (color, position) => {
    const spotLight = new THREE.SpotLight(color, 0.2)
    spotLight.castShadow = true
    spotLight.angle = 0.3
    spotLight.penumbra = 0.2
    spotLight.decay = 2
    spotLight.distance = 40

    spotLight.position.copy(position)

    return spotLight
  }
  animateLight = () => {
    this.tween(this.spotLight_1)
    this.tween(this.spotLight_2)
    this.tween(this.spotLight_3)

    setTimeout( this.animateLight, 3000)
  }
  tween = light => {
    new TWEEN.Tween( light ).to( {
      angle: ( Math.random() * 0.7 ) + 0.1,
      penumbra: Math.random() + 1
    }, Math.random() * 3000/4 + 2000/4 )
    .easing( TWEEN.Easing.Quadratic.Out ).start();

    new TWEEN.Tween( light.position ).to( {
      x: ( Math.random() * 30/4 ) - 15/4,
      y: ( Math.random() * 10/4 ) + 15/4,
      z: ( Math.random() * 30/4 ) - 15/4
    }, Math.random() * 3000/4 + 2000/4 )
    .easing( TWEEN.Easing.Quadratic.Out ).start();
  }
  update = () => {
    // TWEEN.update()
  }
}