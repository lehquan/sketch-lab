import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';
import Experience from './Experience'
import { hexToRgb } from '../utils/utils';

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    // debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('Lights')
    }

    // Wait for resources
    this.resources.on("ready", () => {
      this.setEnv()
    });

    this.setLights()
  }
  setLights = () => {
    const lightColors = {
      AmbientColor: '#9f3632',
      SpotColor: '#372414',
      RectColor: '#341212',
    }

    const ambient = new THREE.AmbientLight(lightColors.AmbientColor, 1)
    this.scene.add(ambient)

    const spot = new THREE.SpotLight(lightColors.SpotColor, 1, 1000)
    spot.position.set(0, 27, 0)
    spot.castShadow = true
    this.scene.add(spot)

    const rectLight = new THREE.RectAreaLight(lightColors.RectColor, 1, 2000, 2000)
    rectLight.position.set(5, 50, 50)
    rectLight.lookAt(0, 0, 0)
    this.scene.add(rectLight)

    // debug
    if (this.debug.active) {
      this.debugFolder.addColor(lightColors, 'AmbientColor')
      .onChange(val => ambient.color = hexToRgb(val))

      this.debugFolder.addColor(lightColors, 'SpotColor')
      .onChange(val => spot.color = hexToRgb(val))

      this.debugFolder.addColor(lightColors, 'RectColor')
      .onChange(val => rectLight.color = hexToRgb(val))
    }

    // point lights
    this.scene.add(this.createPointLight(0xfff000, new THREE.Vector3(0, 10, -100)))
    this.scene.add(this.createPointLight(0x79573e, new THREE.Vector3(100, 10, 0)))
    this.scene.add(this.createPointLight(0xc27439, new THREE.Vector3(20, 5, 20)))

    this.spotLight_1 = this.createSpotLight(0xFF7F00, new THREE.Vector3(15, 40, 45))
    this.spotLight_2 = this.createSpotLight(0x00FF7F, new THREE.Vector3(0, 40, 35))
    this.spotLight_3 = this.createSpotLight(0x7F00FF, new THREE.Vector3(- 15, 40, 45))
    this.scene.add(this.spotLight_1, this.spotLight_2, this.spotLight_3)

    this.animateLight()
  }
  setEnv = () => {
    this.scene.background = new THREE.Color(0x645345)
    // this.scene.background = this.resources.items.chocolate
    // this.scene.fog = new THREE.Fog(0x202533, -1, 100) // => ???
  }
  createSpotLight = (color, position) => {
    const spotLight = new THREE.SpotLight(color, 2)
    spotLight.castShadow = true
    spotLight.angle = 0.3
    spotLight.penumbra = 0.2
    spotLight.decay = 2
    spotLight.distance = 40
    spotLight.intensity = 0.5

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
  createPointLight = (color, position) => {
    const pointLight = new THREE.PointLight(color, 1, 1000, 1)
    pointLight.position.copy(position)

    return pointLight
  }
  animateLight = () => {
    this.tween(this.spotLight_1)
    this.tween(this.spotLight_2)
    this.tween(this.spotLight_3)

    setTimeout( this.animateLight, 5000)
  }
  update = () => {
    TWEEN.update()
  }
}
