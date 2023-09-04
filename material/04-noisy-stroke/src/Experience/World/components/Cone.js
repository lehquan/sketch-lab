import * as THREE from 'three'
import {radians} from '../../../utils/utils';

export default class Cone {
  constructor() {
    this.rotationX = 0
    this.rotationY = 0
    this.rotationZ = radians(-180)
    this.geometry = new THREE.ConeGeometry(0.4, .6, 32)
    this.geometry.center()
  }
}
