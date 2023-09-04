import Experience from '../Experience'
import * as THREE from 'three'
import { gsap } from 'gsap'
import {degToRad, randFloat} from 'three/src/math/MathUtils'

export default class Balloon {
  constructor(_group, _grainMaterial) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.group = _group
    this.grainMaterial = _grainMaterial
    this.count = 5
    this.balloons = []

    this.setBalloons()
  }
  setBalloons = () => {
    const dist = 3
    let angle = 0

    for (let i = 0; i < this.count; i++) {
      const position = new THREE.Vector3(Math.cos(angle) * dist, randFloat(-1, 1), Math.sin(angle) * dist)
      const scale = randFloat(0.3, 0.7)

      const geometry = new THREE.SphereGeometry(1, 32, 32)
      const balloon = new THREE.Mesh(geometry, this.grainMaterial)
      balloon.scale.set(scale, scale, scale)

      balloon.position.copy(position)
      balloon.speed = Math.random() + randFloat(500, 1000)

      angle += degToRad(360 / 5)
      this.scene.add(balloon)
      this.balloons.push(balloon)

      // this.animate(balloon)
    }
  }
  animate = (_balloon) => {
    gsap.to(_balloon.material, {
      duration: 1.6,
    })
  }
  update = () => {
    for (let i = 0; i < this.balloons.length; i++) {
      const balloon = this.balloons[i]
      balloon.position.y = THREE.MathUtils.lerp(balloon.position.y, (0.5 + Math.sin(performance.now() / balloon.speed)) * 0.8, 0.5)
    }
  }
}
