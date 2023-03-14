import * as THREE from 'three'
import Experience from '../Experience'
import cubeVertex from '../../shaders/cube.vert'
import cubeFragment from '../../shaders/cube.frag'

export default class MyCube {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance

    this.setLight()
    this.setCube()
  }
  setLight = () => {
    const light = new THREE.PointLight(0xffffff, 1, Infinity);
    this.camera.add(light);
    this.scene.add(light);
  }
  setCube = () => {
    const cubeGeo = new THREE.InstancedBufferGeometry().copy(new THREE.BoxGeometry(10, 10, 10));

    cubeGeo.setAttribute("cubePos", new THREE.InstancedBufferAttribute(new Float32Array([
      25, 25, 25,
      25, 25, -25, -25, 25, 25, -25, 25, -25,
      25, -25, 25,
      25, -25, -25, -25, -25, 25, -25, -25, -25
    ]), 3, 1));

    const mat = new THREE.RawShaderMaterial({
      uniforms: {},
      vertexShader: cubeVertex,
      fragmentShader: cubeFragment,
      side: THREE.DoubleSide,
    })

    const cube = new THREE.Mesh(cubeGeo, mat)
    this.scene.add(cube)
  }
  update = () => {

  }
}
