import * as THREE from 'three'
import {radians} from '../../../utils/utils'

export default class Torus {
  constructor() {
    this.rotationX = radians(90)
    this.rotationY = 0
    this.rotationZ = 0
    this.geometry = new THREE.TorusGeometry(0.35, 0.14, 32, 200)
    this.geometry.center()
  }
}
