import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'
import Experience from '../Experience'
import fragmentShader from '../../shaders/particles.frag'
import fragmentSimulation from '../../shaders/fboSimulation.frag'
import vertexShader from '../../shaders/fboSimulation.vert'

export default class FboSimulation {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.renderer = this.experience.renderer.instance

    this.WIDTH = 128 // Texture width for simulation

    this.setModel()
    this.setParticle()
    this.initGPGPU()
  }
  setModel = () => {
    this.model = this.resources.items.skull.scene
    this.facePos = []
    this.model.traverse(child => {
      if (child.isMesh) {
        child.geometry.translate(0, 0.2, 0)
        this.facePos.push(...child.geometry.attributes.position.array)
      }
    })

    this.faceNumber = this.facePos.length / 3
  }
  initGPGPU = () => {
    this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer)
    if ( this.renderer.capabilities.isWebGL2 === false ) {
      this.gpuCompute.setDataType( THREE.HalfFloatType );
    }

    this.dtPosition = this.gpuCompute.createTexture()
    this.fillPosition(this.dtPosition)

    this.positionVariable = this.gpuCompute.addVariable( 'texturePosition', fragmentSimulation, this.dtPosition );

    this.positionVariable.material.uniforms['time'] = { value: 0}

    this.positionVariable.wrapS = THREE.RepeatWrapping
    this.positionVariable.wrapT = THREE.RepeatWrapping

    const error = this.gpuCompute.init()
    if(error) {
      console.error(error)
    }
  }
  fillPosition = ( texture ) => {
    let arr = texture.source.data.data
    for(let i=0; i< arr.length; i=i+4) {

      let rand = Math.floor(Math.random() * this.faceNumber)
      let x = this.facePos[3 * rand]
      let y = this.facePos[3 * rand + 1]
      let z = this.facePos[3 * rand + 2]

      arr[i] = x
      arr[i+1] = y
      arr[i+2] = z
      arr[i+3] = 1
    }
  }
  setParticle = () => {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        positionTexture: {value: null},
        resolution: { value: new THREE.Vector4()}
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending
    })

    let geometry = new THREE.BufferGeometry()
    let positions = new Float32Array(this.WIDTH * this.WIDTH * 3)
    let reference = new Float32Array(this.WIDTH * this.WIDTH * 3)
    for(let i=0; i<this.WIDTH * this.WIDTH; i++) {
      let x = Math.random()
      let y = Math.random()
      let z = Math.random()
      let xx = (i%this.WIDTH)/this.WIDTH
      let yy = ~~(i/this.WIDTH)/this.WIDTH
      positions.set([x,y,z], i*3)
      reference.set([xx,yy], i*2)
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('reference', new THREE.BufferAttribute(reference, 2))

    this.particle = new THREE.Points(geometry, this.material)
    // this.scene.add(particle)
  }
  update = (isEnabled) => {
    if(isEnabled) {
      this.scene.add(this.particle)
      this.positionVariable.material.uniforms.time.value = performance.now() / 1000
      this.gpuCompute.compute()
      this.material.uniforms.positionTexture.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture
    }
    else {
      this.scene.remove(this.particle)
    }
  }
}
