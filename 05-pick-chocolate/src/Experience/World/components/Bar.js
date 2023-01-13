import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry'

export default class Bar {
  constructor() {
    this.rotationX = 0
    this.rotationY = 0
    this.rotationZ = 0
    this.geometry = new RoundedBoxGeometry(1.2, 0.25, 0.5, 1, 0.08)
    this.geometry.center()
  }
}
