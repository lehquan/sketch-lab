import Experience from '../Experience';
import * as THREE from 'three';
import {gsap} from 'gsap'
import {EVT} from '../../utils/contains';

export default class Pillars {
  constructor(_group, _grainMaterial) {
    this.experience = new Experience()
    this.group = _group
    this.grainMaterial = _grainMaterial

    window.addEventListener(EVT.CAMERA_ANIMATE_COMPLETED, () => {
      this.setPillars()
    })
  }
  setPillars = () => {
    const dist = 6
    let angle = 0

    for (let i=0; i< 5; i++) {
      const position = new THREE.Vector3(Math.cos(angle) * dist, -2, Math.sin(angle) * dist)
      const scale = THREE.MathUtils.randFloat(1, 2)

      const geometry = new THREE.CylinderGeometry(0.4, .5, 3, 32)
      geometry.translate(0, 1.5, 0)
      const cylinder = new THREE.Mesh(geometry,this.grainMaterial)
      cylinder.position.copy(position)
      cylinder.scale.set(1, 0, 1)

      angle += THREE.MathUtils.degToRad(360/5)
      this.group.add(cylinder)

      this.animate(cylinder, scale)
    }
  }
  animate = (_cylinder, _scale) => {
    gsap.to(_cylinder.scale, {
      duration: 1.2,
      y: _scale,
      ease: "steps(12)"
    })
  }
  update = () => {}
}
