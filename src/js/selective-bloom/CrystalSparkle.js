import * as THREE from 'three'
import { MathEx } from '@ykob/js-util'
import sparkleVertex from "./shaders/sparkleVertex.vs";
import sparkleFragment from "./shaders/sparkleFragment.vs";

class CrystalSparkle {
  constructor() {
    this.NUM = 1000
    this.addSparkle()
  }
  
  addSparkle = () => {
    const geometry = new THREE.BufferGeometry()
    
    const baPosition = new THREE.BufferAttribute(new Float32Array(this.NUM * 3), 3)
    const baDelay = new THREE.BufferAttribute(new Float32Array(this.NUM), 1, 1)
    const baSpeed = new THREE.BufferAttribute(new Float32Array(this.NUM), 1, 1)
    
    for (let i = 0, ul = this.NUM; i < ul; i++) {
      const radian1 = MathEx.radians(MathEx.randomArbitrary(0, 350) - 75)
      const radian2 = MathEx.radians(MathEx.randomArbitrary(0, 410))
      const radius = Math.random() * Math.random() * 8 + 4
      const spherical = MathEx.spherical(radian1, radian2, radius)
      baPosition.setXYZ(i, spherical[0], spherical[1], spherical[2])
      baDelay.setXYZ(i, Math.random())
      baSpeed.setXYZ(i, MathEx.randomArbitrary(1, 10) * (MathEx.randomInt(0, 1) * 2.0 -1.0))
    }
    geometry.setAttribute('position', baPosition)
    geometry.setAttribute('delay', baDelay)
    geometry.setAttribute('speed', baSpeed)
  
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
      vertexShader: sparkleVertex,
      fragmentShader: sparkleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    
    this.sparkle = new THREE.Points(geometry, this.material)
    this.sparkle.name = 'CrystalSparkle'
    this.sparkle.scale.setScalar(1/8)
  }
  
  start = hex => {
    this.material.uniforms.hex.value = hex
  }
  
  update = time => {
    this.material.uniforms.time.value += time
    this.material.uniforms.hex.value += time
  }
}

export { CrystalSparkle }
