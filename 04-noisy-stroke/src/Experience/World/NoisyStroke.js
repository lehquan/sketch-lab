import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/stroke.vert'
import fragmentShader from '../../shaders/stroke.frag'

export default class NoisyStroke {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.setting = {
      progress: 0
    }

    this.setMaterial()
  }
  setMaterial = () => {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        ...THREE.UniformsLib.lights,
        ...THREE.UniformsLib.fog,
        uTime: { value: 0 },
        uProgress: { value: 0},
        uNoiseTexture: { value: this.resources.items.noiseTexture},
        uColor: { value: new THREE.Color(0xB6CAED) },
      },
      lights: true,
      fog: true,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    })

    // debug
    // if (this.debug.active) {
    //   this.debug.ui.add(this.setting, "progress", 0, 1, 0.0008)
    // }
  }
  update = () => {
    // this.material.uniforms.uTime.value = performance.now() / 2000 // update in component's material
    // this.material.uniforms.uProgress.value = this.setting.progress // for debug gui only
  }
}
