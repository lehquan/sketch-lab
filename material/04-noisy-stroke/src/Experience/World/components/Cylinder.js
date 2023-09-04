import * as THREE from 'three'
import {radians} from '../../../utils/utils';

export default class Cylinder {
  constructor() {
    this.geometry = new THREE.CylinderGeometry(.3, .3, .2, 64)
    this.rotationX = 0
    this.rotationY = 0
    this.rotationZ = radians(-180)
  }
}
