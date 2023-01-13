import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/horizon.vert'
import fragmentShader from '../../shaders/horizon.frag'

export default class Horizon {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.setMaterial()
    this.setObject()
  }
  setMaterial = () => {
    const uniforms = {
      uTime: { value: 0.0 },
      uColorStart: { value: new THREE.Color(0xff000a) },
      uColorEnd: { value: new THREE.Color(0xff661e) }
    }
    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    })
  }
  setObject = () => {
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        this.material
    )
    // plane.position.x = 3
    plane.scale.setScalar(10)
    this.scene.add(plane)
  }
  update = () => {
    this.material.uniforms.uTime.value = performance.now()
  }
}
