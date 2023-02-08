import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/glowing.vert'
import fragmentShader from '../../shaders/glowing.frag'

export default class Glowing {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setMaterial()
  }
  setMaterial = () => {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        s: { value: -1.0},
        b: { value: 1.0},
        p: {  value: 1.0},
        glowColor: { value: new THREE.Color(0xff2255)},
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      // flatShading: false,
      // transparent: true
    })
  }
}
