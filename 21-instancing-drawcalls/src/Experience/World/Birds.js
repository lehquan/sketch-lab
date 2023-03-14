import * as THREE from 'three'
import Experience from '../Experience'
import birdVertex from '../../shaders/birds.vert'
import birdFragment from '../../shaders/birds.frag'
import {Float32BufferAttribute} from 'three';

export default class Birds {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug

    this.params = {
      instances: 50000
    }

    this.setBirds()
  }
  setBirds = () => {

    const vector = new THREE.Vector4()
    const positions = []
    const offsets = []
    const colors = []
    const orientationStart = []
    const orientationEnd = []

    positions.push( 0.025, - 0.025, 0 )
    positions.push( - 0.025, 0.025, 0 )
    positions.push( 0, 0, 0.025 )

    // instance attribute
    for(let i=0; i< this.params.instances; i++) {

      // offsets
      offsets.push(Math.random() -0.5, Math.random() -0.5, Math.random() -0.5)

      // color
      colors.push(Math.random(), Math.random(), Math.random(), Math.random())

      // orientation start
      vector.set(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1, Math.random()*2-1)
      vector.normalize()
      orientationStart.push(vector.x, vector.y, vector.z, vector.w)

      // orientation end
      vector.set(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1, Math.random()*2-1)
      vector.normalize()
      orientationEnd.push(vector.x, vector.y, vector.z, vector.w)
    }

    // geometry
    const geometry = new THREE.InstancedBufferGeometry()
    geometry.instanceCount = this.params.instances

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

    geometry.setAttribute( 'offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3, 1))
    geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( new Float32Array(colors), 4, 1))
    geometry.setAttribute( 'orientationStart', new THREE.InstancedBufferAttribute( new Float32Array( orientationStart ), 4 ) )
    geometry.setAttribute( 'orientationEnd', new THREE.InstancedBufferAttribute( new Float32Array( orientationEnd ), 4 ) )

    // test
    const geo = new THREE.PlaneGeometry(1, 1)
    console.log(geo)

    console.log(geometry)

    // material
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: { value: 1.0},
        sineTime: { value: 1.0}
      },
      vertexShader: birdVertex,
      fragmentShader: birdFragment,
      side: THREE.DoubleSide,
      forceSinglePass: true,
      transparent: true
    })

    this.bird = new THREE.Mesh(geometry, material)
    this.scene.add(this.bird)
  }
  update = () => {
    if (this.bird) {
      // this.bird.rotation.y = performance.now() * 0.0005
      // this.bird.material.uniforms.time.value = performance.now() * 0.005
      // this.bird.material.uniforms.sineTime.value = Math.sin( this.bird.material.uniforms.time.value * 0.05 );
    }

  }
}
