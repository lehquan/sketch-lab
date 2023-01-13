import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.params = {
      spot1: 0xB2954D,
      spot2: 0xe5e1d6,
      spot3: 0x473b1e
    }

    this.setLights()
    this.resources.on("ready", () => {
      this.setEnv()
    });
  }
  /*setLights = () => {
    const light1 = new THREE.AmbientLight(0xe5e1d6, .5)
    this.scene.add(light1)

    const light = new THREE.SpotLight(0xe5e1d6, 1, 10, Math.PI/3, 0.3)
    light.position.set(0, 2, 2)
    light.target.position.set(0, 0, 0)

    light.castShadow = true
    light.shadow.camera.near = 0.1
    light.shadow.camera.far = 9
    light.shadow.bias = 0.0001
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    this.scene.add(light)
  }*/
  setLights = () => {
    const ambient = new THREE.AmbientLight(this.params.spot2, .5)
    this.scene.add(ambient)

    //
    const light = new THREE.SpotLight(this.params.spot2, 1, 10, Math.PI/3, 0.3)
    light.position.set(0, 2, 2)
    light.target.position.set(0, 0, 0)

    light.castShadow = true
    light.shadow.camera.near = 0.1
    light.shadow.camera.far = 9
    light.shadow.bias = 0.0001
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    this.scene.add(light)

    this.spotLight_1 = this.createSpotLight(this.params.spot1, new THREE.Vector3(15, 40, 45))
    this.spotLight_2 = this.createSpotLight(this.params.spot2, new THREE.Vector3(0, 40, 35))
    this.spotLight_3 = this.createSpotLight(this.params.spot3, new THREE.Vector3(- 15, 40, 45))
    this.scene.add(this.spotLight_1, this.spotLight_2, this.spotLight_3)

    this.animateLight()
  }
  createSpotLight = (color, position) => {
    const spotLight = new THREE.SpotLight(color, 3)
    spotLight.castShadow = true
    spotLight.angle = 0.3
    spotLight.penumbra = 0.2
    spotLight.decay = 2
    spotLight.distance = 40
    spotLight.intensity = 0.5
    spotLight.shadow.bias = 0.0001
    spotLight.shadow.mapSize.width = 2048
    spotLight.shadow.mapSize.height = 2048

    spotLight.position.copy(position)

    return spotLight
  }
  tween = light => {
    new TWEEN.Tween( light ).to( {
      angle: ( Math.random() * 0.7 ) + 0.1,
      penumbra: Math.random() + 1
    }, Math.random() * 3000 + 2000 )
    .easing( TWEEN.Easing.Quadratic.Out ).start();

    new TWEEN.Tween( light.position ).to( {
      x: ( Math.random() * 30 ) - 15,
      y: ( Math.random() * 10 ) + 15,
      z: ( Math.random() * 30 ) - 15
    }, Math.random() * 3000 + 2000 )
    .easing( TWEEN.Easing.Quadratic.Out ).start();
  }
  animateLight = () => {
    this.tween(this.spotLight_1)
    this.tween(this.spotLight_2)
    this.tween(this.spotLight_3)

    setTimeout( this.animateLight, 3000)
  }
  setEnv = () => {
    this.scene.background = new THREE.Color(0xe5e1d6)
  }
  update = () => {
    TWEEN.update()
  }
}
