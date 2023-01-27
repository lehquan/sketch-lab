import * as THREE from 'three'
import Experience from "../Experience.js"
import Primitives from './Primitives'
import Statue from './Statue'
import vertexShader from '../../shaders/grain.vert'
import fragmentShader from '../../shaders/grain.frag'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources
    this.guiController = {
      uLightIntensity: 1.1,
      uNoiseCoef: 5.4,
      uNoiseMin: 0.76,
      uNoiseMax: 4,
      uNoiseScale: 0.8,
      light_1: 0.7,
      light_2: 8,
    }

    // container all children of scene
    this.group = new THREE.Group()
    this.group.rotation.y = THREE.MathUtils.degToRad(-100)
    this.group.position.y = -2
    this.scene.add(this.group)

    this.setGrainMaterial()

    // Debug
    if (this.debug.active) this.setGUI()

    // Wait for resources
    this.resources.on("ready", () => {
      this.setGround()
      this.primitives = new Primitives(this.group, this.grainMaterial)
      this.statue = new Statue(this.group, this.grainMaterial)
    })
  }
  setGUI = () => {
    const lightFolder = this.debug.ui.addFolder("Lights position X");
    lightFolder.add(this.guiController, 'light_1', -10, 10)
    .step(0.1)
    .onChange(this.onGUIChanged)
    lightFolder.add(this.guiController, 'light_2', -10, 10)
    .step(0.1)
    .onChange(this.onGUIChanged)

    const grainFolder = this.debug.ui.addFolder('Grain settings')
    grainFolder.add(this.guiController, 'uNoiseCoef', 0, 20)
    .step(0.1)
    .onChange(this.onGUIChanged)
    grainFolder.add(this.guiController, 'uNoiseMin', 0, 1)
    .step(0.1)
    .onChange(this.onGUIChanged)
    grainFolder.add(this.guiController, 'uNoiseMax', 0, 22)
    .step(0.1)
    .onChange(this.onGUIChanged)
    grainFolder.add(this.guiController, 'uNoiseScale', 0, 6)
    .step(0.1)
    .onChange(this.onGUIChanged)
  }
  onGUIChanged = () => {
    this.uniforms.uLightPos.value[0].x = this.guiController.light_1
    this.uniforms.uLightPos.value[1].x = this.guiController.light_2

    this.uniforms.uNoiseCoef.value = this.guiController.uNoiseCoef
    this.uniforms.uNoiseMin.value = this.guiController.uNoiseMin
    this.uniforms.uNoiseMax.value = this.guiController.uNoiseMax
    this.uniforms.uNoiseScale.value = this.guiController.uNoiseScale
  }

  setGround = () => {
    this.ground = this.resources.items.rockyGround.scene
    this.ground.position.y = -2
    this.ground.traverse(child => {
      if(child.material) child.material = this.grainMaterial
    })
    this.group.add(this.ground)
  }
  setGrainMaterial = () => {
    this.uniforms = {
      uLightPos: {
        value: [new THREE.Vector3(0, 3, 1), new THREE.Vector3(10, 3, 1)],
      },
      uLightColor: {
        value: [new THREE.Color(0x555555), new THREE.Color(0x555555)],
      },
      uLightIntensity: { value: this.guiController.uLightIntensity},
      uNoiseCoef: { value: this.guiController.uNoiseCoef},
      uNoiseMin: { value: this.guiController.uNoiseMin },
      uNoiseMax: { value: this.guiController.uNoiseMax},
      uNoiseScale: {value: this.guiController.uNoiseScale},
      uColor: { value: new THREE.Color(0x749bff)},
      // uColor: { value: new THREE.Color(0xa5c9a5)},
    }
    this.grainMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: this.uniforms
    })
  }
  update() {
    if (this.primitives) this.primitives.update()
    if (this.statue) this.statue.update()
  }
}
