import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/portal.vert'
import fragmentShader from '../../shaders/portal.frag'

export default class Portal {
  constructor() {
    this.experience = new Experience
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setMaterial()
    this.setObject()
  }
  setMaterial = () => {
    // Credit: https://www.shadertoy.com/view/ldKGDh
    const uniforms = {
      iTime: { value: 0 },
      iChannel0: {
        value: this.resources.items.greynoise
      },
      iResolution: {
        value: new THREE.Vector2(1,1)
      },
    }
    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  }
  setObject = () => {
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        this.material
    )
    // plane.position.x = -3
    plane.scale.setScalar(7)
    this.scene.add(plane)
  }
  update = () => {
    this.material.uniforms.iTime.value = performance.now() / 1000
  }
}
