import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry'
import Experience from '../Experience'

export default class SoftShadow {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.clock = new THREE.Clock()

    this.count = 50

    this.setDOM()
    this.setObject()
  }
  setDOM = () => {
    const button = document.createElement('button')
    button.innerHTML = 'START'
    document.body.appendChild(button)
  }
  setObject = () => {
    // cube
    this.cube = new THREE.Mesh(
        new RoundedBoxGeometry(50, 50, 50, 2, 2),
        new THREE.MeshStandardMaterial({
          color:  0xFFB84C,
          emissive: 'tan',
          emissiveIntensity: 0.1,
          metalness: 0,
          roughness: 1
        })
    )
    // this.cube.scale.setScalar(50)
    this.scene.add(this.cube)

    // spheres
    const geometry = new THREE.IcosahedronGeometry(2, 2)
    const material = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 50
    })

    for(let i =0; i<this.count; i++) {
      const sphere = new THREE.Mesh(geometry, material)
      sphere.add( new THREE.PointLight('white', -0.5, 20)) // negative light!!!

      this.cube.add(sphere)
    }

  }
  update = () => {
    const time = this.clock.getElapsedTime()

    this.cube.rotation.set(time/3, time/5, time/7)

    for(let i=0; i< this.count; i++) {
      // ball
      const ball = this.cube.children[i]
      const phi = -i + time / 2 + Math.sin(3 * time - i) / 2
      const theta = i * i - time / 2 + Math.cos(3 * time + i) / 2

      ball.position.setFromSphericalCoords(1, phi, theta) // or 60?

      // 27 is cube geometry size/2 + 2
      const m = 27 / Math.max(Math.abs(ball.position.x), Math.abs(ball.position.y), Math.abs(ball.position.z));
      ball.position.multiplyScalar(m);
    }
  }
}
