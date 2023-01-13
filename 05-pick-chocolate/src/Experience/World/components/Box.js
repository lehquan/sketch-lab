import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry'

export default class Box {
  constructor() {
    this.geometry = new RoundedBoxGeometry(.7, .7, .7, 1, 0.1)
    this.rotationX = 0
    this.rotationY = 0
    this.rotationZ = 0
  }
}
