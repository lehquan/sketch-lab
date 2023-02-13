import * as THREE from 'three'
import Experience from '../Experience'
export default class Koi {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.params = {
      numPoints: 511,

      // path
      cSegments: 6,
    }

    this.setPath()
    this.setModel()
  }
  setPath = () => {
    const baseVector = new THREE.Vector3(40, 0, 0)
    const axis = new THREE.Vector3(0, 1, 0)
    const cPts = [] // this contains all vec3 to create curve
    const cStep = Math.PI * 2 / this.params.cSegments
    for (let i = 0; i < this.params.cSegments; i++){
      cPts.push(
          new THREE.Vector3().copy(baseVector)
              //.setLength(35 + (Math.random() - 0.5) * 5)
              .applyAxisAngle(axis, cStep * i).setY(THREE.MathUtils.randFloat(-10, 10))
      );
    }
    this.curve = new THREE.CatmullRomCurve3(cPts)
    this.curve.closed = true

    // Divide {this.curve} into {numPoints} pieces/points
    // => returns set of points that are equally distributed along {this.curve}.
    // The distances between points are kept equal in 3D space.
    // So depending on where your camera is rendering from, the points may appear closer that it actually is.
    let cPoints = this.curve.getSpacedPoints(this.params.numPoints) // try this with 5

    // Generates data(the Frenet Frames) to create TubeGeometry or ExtrudeGeometry,
    // Including binormals, normals, tangents. Used in geometries like TubeGeometry or ExtrudeGeometry.
    let cObjects = this.curve.computeFrenetFrames(this.params.numPoints, true)

    // create line for visualization: optional
    let pGeom = new THREE.BufferGeometry().setFromPoints(cPoints)
    let pMat = new THREE.LineBasicMaterial({color: "yellow"})
    let pathLine = new THREE.Line(pGeom, pMat)
    this.scene.add(pathLine);

    // data texture
    this.createDataTexture(cPoints, cObjects)
  }
  /**
   * THREE.DataTexture: Creates a texture directly from raw data, width and height.
   * @param cPoints  : set of points distant equally in 3D
   * @param cObjects : Including binormals, normals, tangents
   */
  createDataTexture = (cPoints, cObjects) => {
    let data = []

    cPoints.forEach( v => { data.push(v.x, v.y, v.z,0.0);} );  // 4 channels
    cObjects.binormals.forEach( v => { data.push(v.x, v.y, v.z,0.0);} );
    cObjects.normals.forEach( v => { data.push(v.x, v.y, v.z,0.0);} );
    cObjects.tangents.forEach( v => { data.push(v.x, v.y, v.z,0.0);} );

    let dataArray = new Float32Array(data)
    this.dataTexture = new THREE.DataTexture(dataArray, this.params.numPoints + 1, 4, THREE.RGBAFormat, THREE.FloatType)
    this.dataTexture.magFilter = THREE.NearestFilter
    this.dataTexture.wrapS = this.dataTexture.wrapT = THREE.RepeatWrapping
    this.dataTexture.needsUpdate = true
  }
  setModel = () =>{
    this.resource = this.resources.items.koiModel
    const objGeom = this.resource
    objGeom.center();
    objGeom.rotateX(-Math.PI * 0.5);
    objGeom.scale(0.3, 0.3, 0.3);
    const bbox = new THREE.Box3().setFromBufferAttribute(objGeom.getAttribute("position"));
    const size = bbox.getSize(new THREE.Vector3());
    console.log(this.curve.cacheArcLengths[200])

    this.material = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      wireframe: true,
    })
    this.material.onBeforeCompile = shader => {
      shader.uniforms.uSpatialTexture = { value: this.dataTexture }
      shader.uniforms.uTextureSize = { value: new THREE.Vector2(this.params.numPoints + 1, 4)}
      shader.uniforms.time = { value: 0 }
      shader.uniforms.uLengthRatio = { value: size.z / this.curve.cacheArcLengths[200] }
      shader.uniforms.uObjSize = { value: size}

      shader.vertexShader = `
      uniform sampler2D uSpatialTexture;
      uniform vec2 uTextureSize;
      uniform float time;
      uniform float uLengthRatio;
      uniform vec3 uObjSize;

      struct splineData {
        vec3 point;
        vec3 binormal;
        vec3 normal;
      };

      splineData getSplineData(float t){
        float step = 1.0 / uTextureSize.y;
        float halfStep = step * 0.5;
        splineData sd;

        sd.point    = texture2D(uSpatialTexture, vec2(t, step * 0.0 + halfStep)).rgb;
        sd.binormal = texture2D(uSpatialTexture, vec2(t, step * 1.0 + halfStep)).rgb;
        sd.normal   = texture2D(uSpatialTexture, vec2(t, step * 2.0 + halfStep)).rgb;

        // return P, B, N data of 1 point at t
        return sd;
      }
      ` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>

      vec3 pos = position;

      float d = pos.z / uObjSize.z;
      float t = fract((time * 0.1) + (d * uLengthRatio));

      float wStep = 1.0 / uTextureSize.x;
      float hWStep = wStep * 0.5;

      float numPrev = floor(t / wStep);
      float numNext = numPrev + 1.0;

      float tPrev = numPrev * wStep + hWStep;
      float tNext = numNext * wStep  + hWStep;

      splineData splinePrev = getSplineData(tPrev);
      splineData splineNext = getSplineData(tNext);

      float f = (t - tPrev) / wStep; // 0~1
      vec3 P = mix(splinePrev.point, splineNext.point, f);
      vec3 B = mix(splinePrev.binormal, splineNext.binormal, f);
      vec3 N = mix(splinePrev.normal, splineNext.normal, f);

      // fish transformed
      transformed = P + (N * pos.x) + (B * pos.y); `
      );

      this.material.userData.shader = shader
    }

    this.model = new THREE.Mesh(objGeom, this.material);
    this.scene.add(this.model);
  }
  update = () => {
    if (this.material) {
      const shader = this.material.userData.shader
      if (shader) shader.uniforms.time.value = performance.now() * 0.001
    }
  }
}
