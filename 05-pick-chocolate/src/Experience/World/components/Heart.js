import * as THREE from 'three'
import {radians} from '../../../utils/utils';

export default class Heart {
  constructor() {
    this.rotationX = radians(90)
    this.rotationY = 0
    this.rotationZ = 0
    this.geometry = this.setHeartGeo()
  }
  setHeartGeo = () => {
    const x = 0, y = 0;
    const ratio = 2
    const extrudeSettings = { depth: 0.125, bevelEnabled: true, bevelSegments: 10, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };

    const heartShape = new THREE.Shape()
    .moveTo( x + 0.25/ratio, y + 0.25/ratio )
    .bezierCurveTo( x + 0.25/ratio, y + 0.25/ratio, x + 0.2/ratio, y, x, y )
    .bezierCurveTo( x - 0.3/ratio, y, x - 0.3/ratio, y + 0.35/ratio, x - 0.3/ratio, y + 0.35/ratio )
    .bezierCurveTo( x - 0.3/ratio, y + 0.55/ratio, x - 0.1/ratio, y + 0.77/ratio, x + 0.25/ratio, y + 0.95/ratio )
    .bezierCurveTo( x + 0.6/ratio, y + 0.77/ratio, x + 0.8/ratio, y + 0.55/ratio, x + 0.8/ratio, y + 0.35/ratio )
    .bezierCurveTo( x + 0.8/ratio, y + 0.35/ratio, x + 0.8/ratio, y, x + 0.5/ratio, y )
    .bezierCurveTo( x + 0.35/ratio, y, x + 0.25/ratio, y + 0.25/ratio, x + 0.25/ratio, y + 0.25/ratio );

    const geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );
    geometry.center()
    return geometry
  }
}
