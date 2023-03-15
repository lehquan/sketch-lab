import * as THREE from 'three'
import Experience from '../Experience';
import vertexShader from '../../shaders/crystal.vert'
import fragmentShader from '../../shaders/crystal.frag'

export default class Crystal {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.count = 10000
    this.setCrystal()
  }
  setCrystal = () => {
    const geometry = new THREE.BufferGeometry()

    const vertices = []
    const delays = []
    const speeds = []

    const spherical = new THREE.Spherical();
    for(let i = 0; i < this.count; i++){
      spherical.phi = Math.random() * Math.PI;
      spherical.theta = Math.random() * Math.PI * 2;
      spherical.radius = Math.random() * 500;

      const vec = new THREE.Vector3().setFromSpherical(spherical)
      vertices.push(vec.x, vec.y, vec.z)
      delays.push(Math.random())
      speeds.push(THREE.MathUtils.randFloat(.5, 1) * (THREE.MathUtils.randInt(0, 1) * 2.0 -1.0))
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('delay', new THREE.Float32BufferAttribute(delays, 1))
    geometry.setAttribute('speed', new THREE.Float32BufferAttribute(speeds, 1))

    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0
        },
        pixelRatio: {
          type: 'f',
          value: window.devicePixelRatio
        },
        hex: {
          type: 'f',
          value: 0
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.sparkle = new THREE.Points(geometry, this.material)
    this.sparkle.position.set(0, 0, 50)

    //
    this.scene.add(this.sparkle)
    this.start(Math.random())
  }
  start = hex => {
    this.material.uniforms.hex.value = hex
  }
  update = () => {
    if (this.sparkle) {
      this.sparkle.rotation.y = -performance.now() / 10000
      this.material.uniforms.time.value = performance.now() / 3000
      this.material.uniforms.hex.value = performance.now() / 3000
    }
  }
}
