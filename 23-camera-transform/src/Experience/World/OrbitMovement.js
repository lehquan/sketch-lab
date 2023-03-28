import * as THREE from 'three'
import Experience from '../Experience'

export default class OrbitMovement {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources

    // enable post-processing
    this.experience.isPostRender = true

    this.planet = {
      orbitRadius: 100,
      inclination: 23
    }

    this.setEnvironment()
    this.setObjects()
    this.setPath()
  }

  setEnvironment = () => {
    this.camera.position.set(0, 100, 200)

    this.scene.background = new THREE.Color(0x000000)

    // lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 1))
    this.scene.add(new THREE.PointLight(0xffffff, 2))
  }

  setObjects = () => {

    // earth
    const geo = new THREE.SphereGeometry(15, 32, 16)
    const mat = new THREE.MeshStandardMaterial({
      map: this.resources.items.colorMap,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: .5
    })
    this.earth = new THREE.Mesh(geo, mat)
    this.earth.castShadow = true
    this.earth.receiveShadow = true
    this.earth.scale.setScalar(2)
    // this.scene.add(this.earth)

    // moon
    const moonGeo = new THREE.SphereGeometry(5, 32, 16)
    const moonMat = new THREE.MeshStandardMaterial({
      roughness: 1,
      aoMap: this.resources.items.rock,
      map: this.resources.items.rock,
    })
    this.moon = new THREE.Mesh(moonGeo, moonMat)
    this.moon.rotation.order = "YZX"
  }
  setPath = () => {
    const pts = new THREE.Path().absarc(0, 0, this.planet.orbitRadius, 0,
        Math.PI * 2).getPoints(90)
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    geo.rotateX(Math.PI * 0.5)
    const mat = new THREE.MeshBasicMaterial({
      color: 'gray',
      transparent: true,
      opacity: 0.6
    })

    this.path = new THREE.Line(geo, mat)
    this.path.add(this.moon)
    this.scene.add(this.path)
  }

  update = () => {
    const t = performance.now() / 2000

    if(this.earth) {
      this.earth.rotation.y = this.earth.rotation.z = t
    }

    if (this.moon) {
      this.moon.position.set(Math.cos(t), 0, -Math.sin(t)).multiplyScalar(this.planet.orbitRadius)
      this.moon.rotation.y = t - Math.PI * 0.5
      this.moon.rotation.z = Math.PI * 0.5

      this.path.rotation.set(
          performance.now() / 5000 + Math.PI,
          performance.now() / 5000 + Math.PI,
          performance.now() / 5000 + Math.PI
      )
    }
  }
}
