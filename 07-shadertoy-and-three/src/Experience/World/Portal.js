import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/portal.vert'
import fragmentShader from '../../shaders/portal.frag'

// import vertexShader from '../../shaders/tunnel.vert'
// import fragmentShader from '../../shaders/tunnel.frag'

export default class Portal {
  constructor() {
    this.experience = new Experience
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.clock = new THREE.Clock()

    this.setMaterial()
  }
  setMaterial = () => {
    // Credit: https://www.shadertoy.com/view/ldKGDh
    this.uniforms = {
      iTime:      { type: 'f', value: 0.1 },
      iChannel0:  { type: 't', value: this.resources.items.greynoise },
      iResolution: { value: new THREE.Vector2( window.innerWidth, window.innerHeight) }
    }
    this.uniforms.iChannel0.value.wrapS = this.uniforms.iChannel0.value.wrapT = THREE.RepeatWrapping;

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })

    // Credit: https://www.shadertoy.com/view/4sXSzs
    /*this.uniforms = {
      iTime:    { type: 'f', value: 0.1 },
      iChannel0:  { type: 't', value: this.resources.items.ichannel0 },
      iChannel1:  { type: 't', value: this.resources.items.ichannel1  },
    };
    this.uniforms.iChannel0.value.wrapS = this.uniforms.iChannel0.value.wrapT = THREE.RepeatWrapping;
    this.uniforms.iChannel1.value.wrapS = this.uniforms.iChannel1.value.wrapT = THREE.RepeatWrapping;

    this.material = new THREE.ShaderMaterial( {
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side:THREE.DoubleSide
    } );*/

    const plane = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), material)
    plane.scale.setScalar(10)
    this.scene.add(plane)
  }
  update = () => {
    // this.material.uniforms.iTime.value = performance.now() / 1000
    this.uniforms.iTime.value = performance.now() / 1000
  }
}
