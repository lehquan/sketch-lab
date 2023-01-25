import * as THREE from 'three'
import { MathEx } from '@ykob/js-util'
import Experience from '../Experience';
import vertexShader from '../../shaders/crystal.vert'
import fragmentShader from '../../shaders/crystal.frag'

export default class Crystal {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.clock = new THREE.Clock()

    this.count = 2000
    this.setCrystal()
  }
  setCrystal = () => {
    const geometry = new THREE.BufferGeometry()

    const vertices = []
    const delays = []
    const speeds = []

    for (let i = 0; i<this.count; i++) {
      const radian1 = MathEx.radians(MathEx.randomArbitrary(0, 350) - 75)
      const radian2 = MathEx.radians(MathEx.randomArbitrary(0, 410))
      const radius = Math.random() * Math.random() * 8 + 4
      const spherical = MathEx.spherical(radian1, radian2, radius)

      vertices.push(spherical[0], spherical[1], spherical[2])
      delays.push(Math.random())
      speeds.push(MathEx.randomArbitrary(1, 10) * (THREE.MathUtils.randInt(0, 1) * 2.0 -1.0))
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
    this.sparkle.name = 'CrystalSparkle'
    this.sparkle.scale.setScalar(1/4)

    //
    this.scene.add(this.sparkle)
    this.start(0)
  }
  start = hex => {
    this.material.uniforms.hex.value = hex
  }
  update = () => {
    const time = this.clock.getDelta()

    this.material.uniforms.time.value += time
    this.material.uniforms.hex.value += time
  }
}
