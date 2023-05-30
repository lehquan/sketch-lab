import * as THREE from 'three'
import { Water } from 'three/addons/objects/Water'
import { Sky } from 'three/addons/objects/Sky'
import Experience from '../Experience'

export default class WaterPlane {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.renderer = this.experience.renderer.instance
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.params = {
      inclination: 0.49,
      azimuth: 0.205,

      // 66 arc seconds -> degrees, and the cosine of that
      sunScale: 0.99999 //0.99956676946448443553574619906976478926848692873900859324
    }
    this.size = 10000

    this.setEnv()
    this.addObject()
    this.addWater()
    this.addSky()
    this.setDebug()
  }
  setEnv = () => {
    this.camera.position.set(0, 6, 400)
  }
  addObject = () => {
    this.box = new THREE.Mesh(
        new THREE.BoxGeometry( 30, 30, 30 ),
        new THREE.MeshStandardMaterial( {
          roughness: 0,
          metalness: 1,
          color: new THREE.Color(0xFFBF86) } ) )
    this.scene.add( this.box )
  }
  addWater = () => {
    const normalTexture = this.resources.items.waterNormal
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping

    const geometry = new THREE.PlaneGeometry(this.size, this.size)
    this.water = new Water(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: normalTexture,
      alpha: 1.0,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xFFEAD2,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined
    })
    this.water.rotation.x = -Math.PI / 2
    this.scene.add(this.water)
  }
  addSky = () => {

    // sky: https://threejs.org/examples/webgl_shaders_sky.html
    this.sky = new Sky()
    this.sky.scale.setScalar(this.size)
    this.scene.add( this.sky )

    // update this.sky material
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
  setDebug = () => {
    if(!this.debug.active) return

    const debugFolder = this.debug.ui.addFolder('Sun')
    debugFolder.add(this.params, "sunScale", 0.9, 0.99999, .00001).onChange(val => {
      this.uniforms.uScale.value = val
    })
    debugFolder.add(this.params, "inclination", 0.41, 0.51, .01).onChange(val => {
      this.updateSun(val)
    })
  }
  update = () => {
    this.water.material.uniforms.time.value = performance.now() / 1000

    // this.box.position.y = Math.sin( performance.now() / 800 ) * 40 + 5
    // this.box.rotation.x = performance.now() / 500 * 0.5
    // this.box.rotation.z = performance.now() / 500 * 0.51
  }
}
