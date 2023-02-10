import * as THREE from 'three'
import Experience from '../Experience';
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
    let baseVector = new THREE.Vector3(40, 0, 0)
    let axis = new THREE.Vector3(0, 1, 0)
    let cPts = [];
    let cStep = Math.PI * 2 / this.params.cSegments;
    for (let i = 0; i < this.params.cSegments; i++){
      cPts.push(
          new THREE.Vector3().copy(baseVector)
              //.setLength(35 + (Math.random() - 0.5) * 5)
              .applyAxisAngle(axis, cStep * i).setY(THREE.MathUtils.randFloat(-10, 10))
      );
    }
    this.curve = new THREE.CatmullRomCurve3(cPts);
    this.curve.closed = true;

    let cPoints = this.curve.getSpacedPoints(this.params.numPoints);
    let cObjects = this.curve.computeFrenetFrames(this.params.numPoints, true);
    let pGeom = new THREE.BufferGeometry().setFromPoints(cPoints);
    let pMat = new THREE.LineBasicMaterial({color: "yellow"});
    let pathLine = new THREE.Line(pGeom, pMat);
    this.scene.add(pathLine);

    // data texture
    this.createDataTexture(cPoints, cObjects)
  }
  createDataTexture = (cPoints, cObjects) => {
    let data = [];
    cPoints.forEach( v => { data.push(v.x, v.y, v.z,0.);} );  // 4 channels
    cObjects.binormals.forEach( v => { data.push(v.x, v.y, v.z,0.);} );
    cObjects.normals.forEach( v => { data.push(v.x, v.y, v.z,0.);} );
    cObjects.tangents.forEach( v => { data.push(v.x, v.y, v.z,0.);} );

    let dataArray = new Float32Array(data);
    this.dataTexture = new THREE.DataTexture(dataArray, this.params.numPoints + 1, 4, THREE.RGBAFormat, THREE.FloatType);
    this.dataTexture.magFilter = THREE.NearestFilter;
    this.dataTexture.wrapS = this.dataTexture.wrapT = THREE.RepeatWrapping;
    this.dataTexture.needsUpdate = true;
  }
  setModel = () =>{
    this.resource = this.resources.items.koiModel
    const objGeom = this.resource
    objGeom.center();
    objGeom.rotateX(-Math.PI * 0.5);
    objGeom.scale(0.3, 0.3, 0.3);
    const bbox = new THREE.Box3().setFromBufferAttribute(objGeom.getAttribute("position"));
    const size = bbox.getSize(new THREE.Vector3());

    this.material = new THREE.MeshBasicMaterial({color: 0xff6600, wireframe: true})
    this.material.onBeforeCompile = shader => {
      shader.uniforms.uSpatialTexture = { value: this.dataTexture }
      shader.uniforms.uTextureSize = { value: new THREE.Vector2(this.params.numPoints + 1, 4)}
      shader.uniforms.time = { value: 0 };
      shader.uniforms.uLengthRatio = { value: size.z / this.curve.cacheArcLengths[200]}
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
        return sd;
      }
  ` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>

      vec3 pos = position;

      float wStep = 1. / uTextureSize.x;
      float hWStep = wStep * 0.5;

      float d = pos.z / uObjSize.z;
      float t = fract((time * 0.1) + (d * uLengthRatio));
      float numPrev = floor(t / wStep);
      float numNext = numPrev + 1.;
      float tPrev = numPrev * wStep + hWStep;
      float tNext = numNext * wStep + hWStep;
      splineData splinePrev = getSplineData(tPrev);
      splineData splineNext = getSplineData(tNext);

      float f = (t - tPrev) / wStep;
      vec3 P = mix(splinePrev.point, splineNext.point, f);
      vec3 B = mix(splinePrev.binormal, splineNext.binormal, f);
      vec3 N = mix(splinePrev.normal, splineNext.normal, f);

      transformed = P + (N * pos.x) + (B * pos.y);
  `
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
