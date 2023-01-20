import * as THREE from 'three'
import Experience from '../Experience'

export default class Koi {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.resource = this.resources.items.koiModel
    this.numPoints = 511

    this.createPath()
    this.setModel()
  }
  createPath = () => {
    const cPts = []
    /*const baseVector = new THREE.Vector3(40, 0, 0)
    const axis = new THREE.Vector3(0, 1, 0)
    const cSegments = 6
    const cStep = Math.PI * 2 / cSegments
    for( let i=0; i< cSegments; i++) {
      cPts.push(new THREE.Vector3().copy(baseVector)
      .setLength(100 + (Math.random() - .5) * .5)
      .applyAxisAngle(axis, cStep * i)
      .setY(THREE.MathUtils.randFloat(-50, 50)))
    }*/
    const radius = 25
    const turns = 3
    const cSegments = 30
    const cStep = (Math.PI * 2) / cSegments
    const heightStep = 2.5

    for(let i=0; i< turns*cSegments; i++) {
      cPts.push(new THREE.Vector3(Math.cos(cStep * i) * radius, heightStep * i, Math.sin(cStep * i) * radius))
    }

    this.curve = new THREE.CatmullRomCurve3(cPts)
    this.curve.closed = true

    const cPoints = this.curve.getSpacedPoints(this.numPoints);
    const cObjects = this.curve.computeFrenetFrames(this.numPoints, true);
    const pGeom = new THREE.BufferGeometry().setFromPoints(cPoints);
    const pMat = new THREE.LineBasicMaterial({color: "yellow"});
    const linePath = new THREE.Line(pGeom, pMat)
    linePath.position.set(0, -50, 0)
    this.scene.add(linePath)

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
    this.dataTexture = new THREE.DataTexture(dataArray, this.numPoints + 1, 4, THREE.RGBAFormat, THREE.FloatType);
    this.dataTexture.magFilter = THREE.NearestFilter;
    this.dataTexture.wrapS = this.dataTexture.wrapT = THREE.RepeatWrapping;
    this.dataTexture.needsUpdate = true;
  }
  setModel = () => {
    const objGeom = this.resource
    objGeom.center();
    objGeom.rotateX(-Math.PI * 0.5)
    objGeom.rotateZ(Math.PI/180 * 180)
    objGeom.scale(0.3, 0.3, 0.3);
    const bbox = new THREE.Box3().setFromBufferAttribute(objGeom.getAttribute("position"));
    const size = bbox.getSize(new THREE.Vector3());

    const material = new THREE.MeshBasicMaterial({color: 0xff6600, wireframe: true})
    material.onBeforeCompile = shader => {
      shader.uniforms.uSpatialTexture = { value: this.dataTexture }
      shader.uniforms.uTextureSize = { value: new THREE.Vector2(this.numPoints + 1, 4)}
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

      material.userData.shader = shader
    }

    this.model = new THREE.Mesh(objGeom, material);
    this.model.position.set(0, -50, 0)
    this.scene.add(this.model);
  }
  update = () => {
    if (this.model) {
      const shader = this.model.material.userData.shader;
      if ( shader ) {
        shader.uniforms.time.value = performance.now() * 0.0005
      }
    }
  }
}
