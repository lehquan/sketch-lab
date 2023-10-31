import * as THREE from 'three'

export default class Spline {
  constructor() {

    this.numPoints = 511

    // test
    window.spline = this
  }
  generatePath = (length, low, segments) => {
    // console.log('generate path: ', length, low, Math.abs(low), segments)

    const baseVector = new THREE.Vector3(40, 0, 0)
    const axis = new THREE.Vector3(0, 1, 0)
    const pos = [] // this contains all vec3 to create curve
    const cStep = Math.PI * 2 / segments

    for (let i = 0; i < segments; i++) {
      pos.push(
          new THREE.Vector3().copy(baseVector)
          .setLength(length + (Math.random() - 0.5) * 5)
          .applyAxisAngle(axis, cStep * i)
          .setY(THREE.MathUtils.randFloat(-50, -10))
      );
    }
    this.curve = new THREE.CatmullRomCurve3(pos)
    this.curve.closed = true

    let points = this.curve.getSpacedPoints(this.numPoints)
    this.createDataTexture(points)

    // create lines for visualization
    let mat = new THREE.LineBasicMaterial({
      color: Math.random() * 0xDB005B,
      transparent: true,
      opacity: 0.3
    })
    let geo = new THREE.BufferGeometry().setFromPoints(points)
    this.line = new THREE.Line(geo, mat)
  }
  createDataTexture = pointSet => {
    let rData = []

    pointSet.forEach( v => { rData.push(v.x, v.y, v.z,0.0);} );

    // Generates data object containing tangents, normals and binormals.
    let data = this.curve.computeFrenetFrames(this.numPoints, true)
    data.binormals.forEach( v => { rData.push(v.x, v.y, v.z,0.0);} );
    data.normals.forEach( v => { rData.push(v.x, v.y, v.z,0.0);} );
    data.tangents.forEach( v => { rData.push(v.x, v.y, v.z,0.0);} );

    const dataArray = new Float32Array(rData)
    this.dataTexture = new THREE.DataTexture(dataArray, this.numPoints + 1, 4, THREE.RGBAFormat, THREE.FloatType)
    this.dataTexture.magFilter = THREE.NearestFilter
    this.dataTexture.wrapS = this.dataTexture.wrapT = THREE.RepeatWrapping
    this.dataTexture.needsUpdate = true
  }
}
