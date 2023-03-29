import * as THREE from 'three'
import Experience from '../Experience'
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry';

export default class Glass {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.renderer = this.experience.renderer.instance
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.params = {
      metalness: 0,
      roughness: .5,
      transmission: 1,
      thickness: 1.5,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    }

    this.setEnv()
    this.setMaterial()
    this.setObjects()
    this.setDebug()
    this.setFooter()
  }
  setEnv = () => {
    //
    this.camera.position.set(0, 0, 5)

    //
    this.renderer.toneMapping = THREE.NoToneMapping
    this.renderer.toneMapping = 1
    this.renderer.outputEncoding = THREE.LinearEncoding

    //
    const dirLight = new THREE.DirectionalLight(0xfff0dd, 1)
    dirLight.position.set(0, 5, 10)
    this.scene.add(dirLight)
  }
  setMaterial = () => {
    // envMap
    const envTexture = this.resources.items.royal_esplanade
    envTexture.mapping = THREE.EquirectangularReflectionMapping

    this.physicalEnvMap = new THREE.MeshPhysicalMaterial({
      metalness: this.params.metalness,
      roughness: this.params.roughness,
      transmission: this.params.transmission,
      thickness: this.params.thickness,
      envMapIntensity: this.params.envMapIntensity,
      envMap: envTexture
    })

    //
    const normalTexture = this.resources.items.normalMap
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping

    this.physicalNormal = this.physicalEnvMap.clone()
    this.physicalNormal.normalMap = normalTexture
    this.physicalNormal.clearcoatNormalMap = normalTexture
    this.physicalNormal.needsUpdate = true
  }
  setObjects = () => {
    // backdrop
    const mat = new THREE.MeshBasicMaterial({
      map: this.resources.items.backdrop,
      side: THREE.DoubleSide
    })
    const backdrop = new THREE.Mesh( new THREE.PlaneGeometry(8, 8), mat)
    backdrop.position.set(0, 0, -1)
    this.scene.add(backdrop)

    // ico
    this.ico = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, 0),
        this.physicalEnvMap.clone())
    this.ico.rotation.set(Math.random(), Math.random(), Math.random())
    this.ico.position.set(-2.5, 0, 0)
    this.scene.add(this.ico)

    // sphere
    this.sphere = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, 15),
        this.physicalEnvMap.clone())
    this.sphere.material.roughness = 0.67
    this.sphere.material.clearcoat = this.params.clearcoat
    this.sphere.material.clearcoatRoughness = this.params.clearcoatRoughness
    this.sphere.material.needsUpdate = true
    this.sphere.rotation.set(Math.random(), Math.random(), Math.random())
    this.sphere.position.set(0, 1.5, 0)
    this.scene.add(this.sphere)

    // box
    this.box = new THREE.Mesh(
        new RoundedBoxGeometry(1.5, 1.5, 1.5, 16, 0.2),
        this.physicalEnvMap.clone())
    this.box.position.set(2.5, 0, 0)
    this.box.rotation.set(Math.random(), Math.random(), Math.random())
    this.box.material.roughness = 0.01
    this.box.material.needsUpdate = true
    this.scene.add(this.box)

    // tetra
    this.tetra = new THREE.Mesh(
        new THREE.TetrahedronGeometry(1.3, 0),
        this.physicalNormal)
    this.tetra.rotation.set(0, Math.PI/180 * 30, 0)
    this.tetra.position.set(0, -1.5, 0)
    this.scene.add(this.tetra)
  }
  setDebug = () => {
    if (this.debug.active) {

      // Ico
      const icoFolder = this.debug.ui.addFolder('Ico')
      icoFolder.add(this.params, 'metalness', 0, 1, 0.001).onChange(() => {
        this.ico.material.metalness = this.params.metalness
      })
      icoFolder.add(this.params, 'roughness', 0, 1, 0.001).onChange(() => {
        this.ico.material.roughness = this.params.roughness
      })
      icoFolder.add(this.params, 'transmission', 0, 5, 0.001).onChange(() => {
        this.ico.material.transmission = this.params.transmission
      })
      icoFolder.add(this.params, 'thickness', 0, 5, 0.001).onChange(() => {
        this.ico.material.thickness = this.params.thickness
      })
      icoFolder.add(this.params, 'envMapIntensity', 0, 5, 0.001).onChange(() => {
        this.ico.material.envMapIntensity = this.params.envMapIntensity
      })
      icoFolder.close()

      // Sphere
      const sphereFolder = this.debug.ui.addFolder('Sphere')
      sphereFolder.add(this.params, 'metalness', 0, 1, 0.001).onChange(() => {
        this.sphere.material.metalness = this.params.metalness
      })
      sphereFolder.add(this.params, 'roughness', 0, 1, 0.001).onChange(() => {
        this.sphere.material.roughness = this.params.roughness
      })
      sphereFolder.add(this.params, 'clearcoat', 0, 1, 0.001).onChange(() => {
        this.sphere.material.clearcoat = this.params.clearcoat
      })
      sphereFolder.add(this.params, 'clearcoatRoughness', 0, 1, 0.001).onChange(() => {
        this.sphere.material.clearcoatRoughness = this.params.clearcoatRoughness
      })
      sphereFolder.close()

      // Box
      const boxFolder = this.debug.ui.addFolder('Box')
      boxFolder.add(this.params, 'metalness', 0, 1, 0.001).onChange(() => {
        this.box.material.metalness = this.params.metalness
      })
      boxFolder.add(this.params, 'roughness', 0, 1, 0.001).onChange(() => {
        this.box.material.roughness = this.params.roughness
      })
      boxFolder.close()

      // Tetra
      const tetraFolder = this.debug.ui.addFolder('Tetrahedron')
      tetraFolder.add(this.params, 'metalness', 0, 1, 0.001).onChange(() => {
        this.tetra.material.metalness = this.params.metalness
      })
      tetraFolder.add(this.params, 'roughness', 0, 1, 0.001).onChange(() => {
        this.tetra.material.roughness = this.params.roughness
      })
      tetraFolder.add(this.params, 'thickness', 0, 5, 0.001).onChange(() => {
        this.tetra.material.thickness = this.params.thickness
      })
      tetraFolder.add(this.params, 'envMapIntensity', 0, 5, 0.001).onChange(() => {
        this.tetra.material.envMapIntensity = this.params.envMapIntensity
      })
      tetraFolder.close()
    }
  }
  setFooter = () => {
    const footer = document.getElementById('footer')

    const title = document.createElement('p')
    title.classList.add('title')
    title.innerHTML = 'Create transparent glass material with PhysicalMaterial and transmission. ' +
        '<br>' +
        'This is based on ' +
        '<a href="https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/" target="blank">the original tutorial on Codrops.</a> '
    footer.appendChild(title)

    const info = document.createElement('p')
    info.innerHTML = 'USE DEBUG MODE (#debug) FOR TESTING MATERIAL'
    footer.appendChild(info)
  }
}
