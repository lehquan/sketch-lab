import * as THREE from 'three'
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
  
    this.radius = 200
    this.setLight()
    // Wait for resources
    this.resources.on("ready", () => {
      this.setEnv()
    })
  }
  setEnv = () => {
    const texture = this.resources.items.future_parking
    texture.mapping = THREE.EquirectangularReflectionMapping
    this.scene.environment = texture
  
    this.scene.background = new THREE.Color(0xE5E5E5)
  }
  setLight = () => {
    this.scene.add( new THREE.AmbientLight( 0x9e9e9e, 1 ) );
    const front = new THREE.PointLight( 0x9e9e9e, 1, 300 )
    front.position.set(0, 1, 5)
    this.scene.add( front );
  
    this.spotLightMesh = new THREE.Mesh( new THREE.SphereGeometry( 1/10, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x888888, transparent: true, opacity: 0 } ) );
    this.spotLight = new THREE.SpotLight()
    this.spotLight.castShadow = true
    this.spotLight.shadow.mapSize.width = 512
    this.spotLight.shadow.mapSize.height = 512
    this.spotLight.shadow.camera.near = 0.5
    this.spotLight.shadow.camera.far = 100
    this.spotLightMesh.add(this.spotLight);
    this.spotLightMesh.position.set(0, 3, 0)
    this.scene.add( this.spotLightMesh );
  }
  update = () => {
    let t = performance.now() / 2000
    
    if (this.spotLightMesh) {
      this.spotLightMesh.position.set(Math.cos(t), 0, -Math.sin(t)).multiplyScalar(this.radius);
    }
  }
}
