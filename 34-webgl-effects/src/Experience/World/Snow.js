import * as THREE from 'three'
import Experience from '../Experience';

export default class Snow {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.count = 500
    this.maxRange = 200
    this.minRange = this.maxRange / 2
    this.t = 0

    this.addFallingSnow()
  }
  makeSprite = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const spriteSize = 64
    canvas.width = canvas.height = spriteSize * 2
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.arc(spriteSize, spriteSize, spriteSize, 0, Math.PI*2, true)
    ctx.fill()

    const sprite = new THREE.CanvasTexture(canvas)
    sprite.needsUpdate = true

    return sprite
  }
  addFallingSnow = () => {
    const geometry = new THREE.BufferGeometry()
    const positions = []

    for(let i=0; i<this.count; i++) {
      positions.push(
          Math.random() * this.maxRange - this.minRange,
          Math.random() * this.maxRange, // y
          Math.random() * this.maxRange - this.minRange )
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3, 1))

    const material = new THREE.PointsMaterial({
      map: this.makeSprite(),
      blending: THREE.AdditiveBlending,
      depthTest: true,
      transparent: true,
      opacity: 0.2,
      sizeAttenuation: true,
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }
  update = () => {
    if(!this.particles) return

    const arr = this.particles.geometry.attributes.position.array
    this.t += 0.01

    for(let i=0; i<arr.length; i+=3) {
      arr[i + 0] += Math.sin(this.t + i) * 0.05 // x
      arr[i + 2] += Math.cos(this.t + i) * 0.05 // z
      arr[i + 1] -= 0.2 // y

      if ( arr[i + 1] < - this.minRange) {
        arr[i + 1] = this.minRange
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true
  }
}
