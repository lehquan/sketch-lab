import * as THREE from 'three'
import Experience from '../Experience'
import Spline from './Spline';
import {getRandomArbitrary, getRandomFloat} from '../../utils/utils';
import {Water} from 'three/addons/objects/Water';
import {Sky} from 'three/addons/objects/Sky';

export default class Garden {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.renderer = this.experience.renderer.instance
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.clock = new THREE.Clock()

    this.params = {
      color: 0xffffff,
      transmission: 1,
      opacity: 1,
      metalness: 0,
      roughness: 0,
      ior: 1.5,
      thickness: 0.01,
      specularIntensity: 1,
      specularColor: 0xffffff,
      envMapIntensity: 1,
      lightIntensity: 1,

      // sky
      inclination: 0.49,
      azimuth: 0.205,
      // 66 arc seconds -> degrees, and the cosine of that
      sunScale: 0.99999 //0.99956676946448443553574619906976478926848692873900859324
    }
    this.allUniforms = []
    this.minScale = 0.1
    this.maxScale = 0.8
    this.size = 10000/30

    this.spline = new Spline()
    this.setEnv()
    this.addWater()
    this.addSky()
    this.addModels()
    this.setDebug()

    //
    setTimeout(() => {
      for(let i=0; i< 3; i++) {
        this.addFish()
      }
    }, 500)
  }
  setEnv = () => {
    this.camera.position.set(0, 150, 450)
  }
  setDebug = () => {
    if (!this.debug.active) return

    //sun
    const sunDebug = this.debug.ui.addFolder('Sun')
    sunDebug.add(this.params, "sunScale", 0.9, 0.9999, .0001).onChange(val => {
      this.uniforms.uScale.value = val
    })
    sunDebug.add(this.params, "inclination", 0.41, 0.51, .01).onChange(val => {
      this.updateSun(val)
    })

    // koi
    const koiDebug = {
      "Add Koi": () => {
        const s = getRandomFloat(this.minScale, this.maxScale, 1)
        this.addFish(s)
      },
    }
    this.debug.ui.add(koiDebug, "Add Koi")
  }
  updateSun = inclination => {
    this.sun = new THREE.Vector3()
    const theta = Math.PI * (inclination - 0.5)
    const phi = 2 * Math.PI * (this.params.azimuth - 0.5)
    this.sun.x = Math.cos( phi ) * Math.sin( theta )
    this.sun.y = Math.cos( phi ) * Math.sin( theta )
    this.sun.z = Math.cos( phi ) * Math.cos( theta )

    this.sky.material.uniforms.sunPosition.value.copy( this.sun )
    this.water.material.uniforms.sunDirection.value.copy( this.sun )
  }
  addSky = () => {

    // sky
    this.sky = new Sky()
    this.sky.scale.setScalar(5000)
    this.scene.add( this.sky )

    // update sky material
    this.uniforms = {
      uScale: { value: this.params.sunScale }
    }
    this.sky.material.onBeforeCompile = shader => {
      shader.uniforms.uScale = this.uniforms.uScale

      shader.fragmentShader = `
        uniform float uScale;
      ` + shader.fragmentShader
      shader.fragmentShader = shader.fragmentShader.replace(
          `float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );`,
          `float sundisk = smoothstep( uScale, uScale + 0.00002, cosTheta );`
      )
    }

    // sun
    this.updateSun(this.params.inclination)

    // update scene environment to get reflection of water in the box
    const pmremGenerator = new THREE.PMREMGenerator( this.renderer )
    this.scene.environment = pmremGenerator.fromScene( this.sky ).texture
  }
  addWater = () => {
    const normalTexture = this.resources.items.waterNormal2
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping

    // const geometry = new THREE.PlaneGeometry(this.size, this.size)
    const geometry = new THREE.CircleGeometry( this.size, 32 )
    geometry.scale(0.9, 0.8, 1)

    this.water = new Water(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: normalTexture,
      alpha: 1.0,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xFFEAD2,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined,
      transparent: true
    })
    this.water.rotation.x = -Math.PI / 2
    this.water.position.set(0, -25, 0)
    this.scene.add(this.water)

    // this.water.material.onBeforeCompile = shader => {
    //   console.log(shader.vertexShader)
    //   console.log(shader.fragmentShader)
    // }
  }
  addModels = () => {

    // koi
    this.resource = this.resources.items.koiModel
    const objGeom = this.resource
    objGeom.rotateX(-Math.PI * 0.5)
    const material = new THREE.MeshPhysicalMaterial( {
      color: this.params.color,
      metalness: this.params.metalness,
      roughness: this.params.roughness,
      ior: this.params.ior,
      envMapIntensity: this.params.envMapIntensity,
      transmission: this.params.transmission,
      specularIntensity: this.params.specularIntensity,
      specularColor: this.params.specularColor,
      opacity: this.params.opacity,
      side: THREE.DoubleSide,
      transparent: true,
      wireframe: true,
    } );
    this.fish = new THREE.Mesh(objGeom, material)

    // pond
    const pond = this.resources.items.pond
    const pondModel = this.resources.items.pond.scene
    pondModel.scale.setScalar(30)
    pondModel.position.set(0, -30, 0)
    this.scene.add(pondModel)

    //
    this.mixer = new THREE.AnimationMixer(pondModel)
    this.mixer.clipAction(pond.animations[0]).play()
  }
  addFish = (scale = 0.5) => {
    console.log('add fish: ', scale)

    // koi
    const koi = this.fish.clone()
    koi.material = this.fish.material.clone() // => Important!!!
    koi.material.color = new THREE.Color(Math.random() * 0xE55807)
    this.scene.add(koi)

    koi.geometry = koi.geometry.clone()
    koi.geometry.scale(scale, scale, scale)
    koi.geometry.center()
    const bbox = new THREE.Box3().setFromBufferAttribute(koi.geometry.getAttribute("position"))
    this.size = bbox.getSize(new THREE.Vector3())

    // path
    const length = Math.floor(getRandomArbitrary(50, 200))
    const low = Math.floor(getRandomArbitrary(-50, 0))
    const segments = Math.floor(getRandomArbitrary(5, 12))

    this.spline.generatePath(length, low, segments)
    // this.scene.add(this.spline.line)

    // uniforms
    const uniforms = {
      uSpatialTexture: {value: this.spline.dataTexture },
      uTextureSize: {value: new THREE.Vector2(this.spline.numPoints + 1, 4)},
      uTime: {value: 0},
      uSpeed: {value: getRandomArbitrary(0.08, 0.15)},
      uLengthRatio: {value: this.size.z / this.spline.curve.cacheArcLengths[200]}, // ratio to twist the mesh along the path
      uObjSize: {value: this.size}
    }

    this.compileMaterial(koi, uniforms)
    this.allUniforms.push(uniforms)
  }
  compileMaterial = (koi, uniforms) => {
    koi.material.onBeforeCompile = shader => {
      shader.uniforms.uSpatialTexture = uniforms.uSpatialTexture
      shader.uniforms.uTextureSize = uniforms.uTextureSize
      shader.uniforms.uTime = uniforms.uTime
      shader.uniforms.uSpeed = uniforms.uSpeed
      shader.uniforms.uLengthRatio = uniforms.uLengthRatio
      shader.uniforms.uObjSize = uniforms.uObjSize

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
  }
  update = () => {
    //
    if(this.mixer) this.mixer.update(this.clock.getDelta())

    //
    for(let i=0; i<this.allUniforms.length; i++) {
      const uniforms = this.allUniforms[i]
      uniforms.uTime.value = performance.now() / 1000
    }

    // water
    this.water.material.uniforms.time.value = performance.now() / 1000
  }
}
