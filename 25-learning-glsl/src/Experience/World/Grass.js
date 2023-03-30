import * as THREE from 'three'
import Experience from '../Experience'
import grassVertex from '../../shaders/grass.vert'
import grassFragment from '../../shaders/grass.frag'

export default class Grass {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.debug = this.experience.debug

    this.params = {
      count: 5000,
    }
    this.setEnv()
    this.setGrass()
    this.setDebug()
    // this.setFooter()
  }
  setEnv = () => {
    this.camera.position.set(0, 3, 10)

    //
    this.scene.add(new THREE.AmbientLight(0xfae7e7, .5))
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5)
    dirLight1.position.set(10, 10, 5)
    this.scene.add(dirLight1)
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1)
    dirLight2.position.set(0, 10, 5)
    this.scene.add(dirLight2)
    const pointL = new THREE.PointLight(0xffffff, 1)
    pointL.position.set(0, -10, 5)
    this.scene.add(pointL)
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

  setDebug = () => {}
  setGrass = () => {
    const geometry = new THREE.PlaneGeometry(.1, 1, 1, 4)

    this.uniforms = {
      uTime: { value: .1},
      uColor: { value: new THREE.Color(0x16FF00)}
    }
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: grassVertex,
      fragmentShader: grassFragment,
      side: THREE.DoubleSide
    })

    //
    const mesh = new THREE.InstancedMesh(geometry, material, this.params.count)
    mesh.add( new THREE.AxesHelper(10))
    this.scene.add(mesh)

    // position
    const dummy = new THREE.Object3D()

    for(let i=0; i<mesh.count; i++) {
      dummy.position.set((Math.random() - .5) * 10, 0, (Math.random() - .5) * 10)
      dummy.scale.setScalar(Math.random())
      dummy.rotation.y = Math.random() * Math.PI
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
  }
  update = () => {
    this.uniforms.uTime.value = performance.now() / 1000
  }
}
