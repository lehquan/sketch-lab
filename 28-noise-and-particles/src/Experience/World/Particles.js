import * as THREE from 'three'
import Experience from '../Experience'
import sphereVertex from '../../shaders/sphere.vert'
import sphereFragment from '../../shaders/sphere.frag'

export default class Particles {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.setSphere()
    this.setParticles()
  }
  setSphere= () => {
    const geometry = new THREE.SphereGeometry(1, 162, 162)

    this.sUniforms = {
      uTime: { type: 'f', value: 0},
      uResolution: { type: 'v4', value: new THREE.Vector4()},
      uvRate1: { value: new THREE.Vector2(1, 1)},
    }
    const material = new THREE.ShaderMaterial({
      uniforms: this.sUniforms,
      vertexShader: sphereVertex,
      fragmentShader: sphereFragment,
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)
  }
  setParticles = () => {
    const geometry = new THREE.BufferGeometry()
  }
  update = () => {
    this.sUniforms.uTime.value = performance.now() / 1000
  }
}
