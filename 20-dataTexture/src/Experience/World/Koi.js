import * as THREE from 'three'
import Experience from '../Experience'
import {VertexNormalsHelper} from 'three/addons/helpers/VertexNormalsHelper';
export default class Koi {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.clock = new THREE.Clock()

    this.params = {
      numPoints: 511,
      cSegments: 6,
      rSpeed: 0.2,
      bSpeed: 0.1,
    }
    this.spheres = []

    this.setPath()
    this.setModel()
  }

  setPath = () => {
    const baseVector = new THREE.Vector3(40, 0, 0)
    const axis = new THREE.Vector3(0, 1, 0)
    const rPts = [] // this contains all vec3 to create curve
    const bPts = [] // this contains all vec3 to create curve
    const cStep = Math.PI * 2 / this.params.cSegments

    // path 1: Red path
    for (let i = 0; i < this.params.cSegments; i++) {
      rPts.push(
          new THREE.Vector3().copy(baseVector)
              .applyAxisAngle(axis, cStep * i).setY(THREE.MathUtils.randFloat(-10, 10))
      );
    }
    this.redCurve = new THREE.CatmullRomCurve3(rPts)
    this.redCurve.closed = true

    // path 2: Blue Path
    for (let i = 0; i < this.params.cSegments; i++) {
      bPts.push(
          new THREE.Vector3().copy(baseVector)
          .setLength(35 + (Math.random() - 0.5) * 5)
          .applyAxisAngle(axis, cStep * i).setY(THREE.MathUtils.randFloat(-30, 30))
      );
    }
    this.blueCurve = new THREE.CatmullRomCurve3(bPts)
    this.blueCurve.closed = true

    // Divide the curve into {numPoints} pieces/points
    // => returns set of points that are equally distributed along {this.redCurve}.
    // The distances between points are kept equal in 3D space.
    // So depending on where your camera is rendering from, the points may appear closer that it actually is.
    let rPoints = this.redCurve.getSpacedPoints(this.params.numPoints) // try this with 5
    let bPoints = this.blueCurve.getSpacedPoints(this.params.numPoints)

    // create data texture
    this.createDataTexture([rPoints, bPoints])

    // create lines for visualization
    let rMat = new THREE.LineBasicMaterial({color: "red"})
    let rGeom = new THREE.BufferGeometry().setFromPoints(rPoints)
    let rPathLine = new THREE.Line(rGeom, rMat)

    let bMat = new THREE.LineBasicMaterial({color: "blue"})
    let bGeom = new THREE.BufferGeometry().setFromPoints(bPoints)
    let bPathLine = new THREE.Line(bGeom, bMat)

    // show points for debug
    for(let i=0; i< rPoints.length; i++) {
      const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 8),
          new THREE.MeshBasicMaterial()
      )
      sphere.position.copy(rPoints[i])
      sphere.visible = false
      // const helper = new VertexNormalsHelper( sphere, 1, 0xff0000 );
      // this.scene.add( helper );

      this.scene.add(sphere)
      this.spheres.push(sphere)
    }

    // debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("RED Path (only)")
      this.scene.add(rPathLine)
      this.scene.add(bPathLine)
      this.spheres.forEach( sphere => sphere.visible = true)

      const pathDebug = {
        showPath: () => {
          this.scene.add(rPathLine)
        },
        hidePath: () => {
          this.scene.remove(rPathLine)
        },
        showPoints: () => {
          this.spheres.forEach( sphere => sphere.visible = true)
        },
        hidePoints: () => {
          this.spheres.forEach( sphere => sphere.visible = false)
        }
      }
      this.debugFolder.add(pathDebug, "showPath")
      this.debugFolder.add(pathDebug, "hidePath")
      this.debugFolder.add(pathDebug, "showPoints")
      this.debugFolder.add(pathDebug, "hidePoints")
    }
  }
  createDataTexture = pointSet => {
    let rData = []
    let bData = []

    // RED path
    pointSet[0].forEach( v => { rData.push(v.x, v.y, v.z,0.0);} );  // 4 channels

    // Generates rData containing tangents, normals and binormals.
    let rObjects = this.redCurve.computeFrenetFrames(this.params.numPoints, true)
    rObjects.binormals.forEach( v => { rData.push(v.x, v.y, v.z,0.0);} );
    rObjects.normals.forEach( v => { rData.push(v.x, v.y, v.z,0.0);} );
    rObjects.tangents.forEach( v => { rData.push(v.x, v.y, v.z,0.0);} );

    let rDataArray = new Float32Array(rData)
    this.rDataTexture = new THREE.DataTexture(rDataArray, this.params.numPoints + 1, 4, THREE.RGBAFormat, THREE.FloatType)
    this.rDataTexture.magFilter = THREE.NearestFilter
    this.rDataTexture.wrapS = this.rDataTexture.wrapT = THREE.RepeatWrapping
    this.rDataTexture.needsUpdate = true

    // BLUE path
    pointSet[1].forEach( v => { bData.push(v.x, v.y, v.z,0.0);} );  // 4 channels

    // Generates bData containing tangents, normals and binormals.
    let bObjects = this.blueCurve.computeFrenetFrames(this.params.numPoints, true)
    bObjects.binormals.forEach( v => { bData.push(v.x, v.y, v.z,0.0);} );
    bObjects.normals.forEach( v => { bData.push(v.x, v.y, v.z,0.0);} );
    bObjects.tangents.forEach( v => { bData.push(v.x, v.y, v.z,0.0);} );

    let bDataArray = new Float32Array(bData)
    this.bDataTexture = new THREE.DataTexture(bDataArray, this.params.numPoints + 1, 4, THREE.RGBAFormat, THREE.FloatType)
    this.bDataTexture.magFilter = THREE.NearestFilter
    this.bDataTexture.wrapS = this.bDataTexture.wrapT = THREE.RepeatWrapping
    this.bDataTexture.needsUpdate = true
  }
  setModel = () => {
    this.resource = this.resources.items.koiModel
    const objGeom = this.resource
    objGeom.center();
    objGeom.rotateX(-Math.PI * 0.5);
    objGeom.scale(0.3, 0.3, 0.3);
    const bbox = new THREE.Box3().setFromBufferAttribute(objGeom.getAttribute("position"));
    const size = bbox.getSize(new THREE.Vector3());

    const material = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      wireframe: true,
    })
    this.rKoi = new THREE.Mesh(objGeom, material)
    this.scene.add(this.rKoi)

    this.bKoi = this.rKoi.clone()
    this.bKoi.material = this.rKoi.material.clone()
    this.scene.add(this.bKoi)

    // uniforms
    this.rUniforms = {
      uSpatialTexture: {value: this.rDataTexture },
      uTextureSize: {value: new THREE.Vector2(this.params.numPoints + 1, 4)},
      uTime: {value: 0},
      uSpeed: {value: 0.1},
      uLengthRatio: {value: size.z / this.redCurve.cacheArcLengths[200]}, // ratio to twist the mesh along the path
      uObjSize: {value: size}
    }
    this.bUniforms = {
      uSpatialTexture: {value: this.bDataTexture },
      uTextureSize: {value: new THREE.Vector2(this.params.numPoints + 1, 4)},
      uTime: {value: 0},
      uSpeed: {value: 0.1},
      uLengthRatio: {value: size.z / this.blueCurve.cacheArcLengths[200]}, // ratio to twist the mesh along the path
      uObjSize: {value: size}
    }

    this.compileMaterial('r')
    this.compileMaterial('b')

    // debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Koi")
      this.debugFolder.add(this.params, 'rSpeed', 0.1, 0.5, 0.01).onChange(val =>{
        this.rUniforms.uSpeed.value = val
      })
      this.debugFolder.add(this.params, 'bSpeed', 0.1, 0.5, 0.01).onChange(val =>{
        this.bUniforms.uSpeed.value = val
      })
    }
  }
  compileMaterial = type => {
    switch (type) {
      case 'r':
        this.rKoi.material.onBeforeCompile = shader => {
          shader.uniforms.uSpatialTexture = this.rUniforms.uSpatialTexture
          shader.uniforms.uTextureSize = this.rUniforms.uTextureSize
          shader.uniforms.uTime = this.rUniforms.uTime
          shader.uniforms.uSpeed = this.rUniforms.uSpeed
          shader.uniforms.uLengthRatio = this.rUniforms.uLengthRatio
          shader.uniforms.uObjSize = this.rUniforms.uObjSize

          shader.vertexShader = `
      uniform sampler2D uSpatialTexture;
      uniform vec2 uTextureSize;
      uniform float uTime;
      uniform float uSpeed;
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
      float t = fract((uTime * uSpeed) + (d * uLengthRatio));

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
        }
        break;
      case 'b':
        this.bKoi.material.onBeforeCompile = shader => {
          shader.uniforms.uSpatialTexture = this.bUniforms.uSpatialTexture
          shader.uniforms.uTextureSize = this.bUniforms.uTextureSize
          shader.uniforms.uTime = this.bUniforms.uTime
          shader.uniforms.uSpeed = this.bUniforms.uSpeed
          shader.uniforms.uLengthRatio = this.bUniforms.uLengthRatio
          shader.uniforms.uObjSize = this.bUniforms.uObjSize

          shader.vertexShader = `
      uniform sampler2D uSpatialTexture;
      uniform vec2 uTextureSize;
      uniform float uTime;
      uniform float uSpeed;
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
      float t = fract((uTime * uSpeed) + (d * uLengthRatio));

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
        }
        break;
    }
  }
  update = () => {
    if (this.rUniforms) this.rUniforms.uTime.value = performance.now() / 1000
    if (this.bUniforms) this.bUniforms.uTime.value = performance.now() / 1500
  }
}
