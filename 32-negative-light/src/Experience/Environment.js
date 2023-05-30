import * as THREE from 'three'
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.params = {
      backgroundColor: 0xF9FBE7,
      blurriness: 0
    }

    // Wait for resources
    this.resources.on("ready", () => {
      this.setEnv()
      this.setDebug()
    })
  }

  setEnv = () => {

    // lights
    this.scene.add( new THREE.AmbientLight('orange', 0.5)) // 0xF0EDD4
    const pointLight = new THREE.PointLight(0xffffff, 0.5)
    pointLight.position.set(0, 150, 300)
    this.scene.add(pointLight)

    // backgroundColor
    this.scene.background = new THREE.Color(this.params.backgroundColor)

    // sceneTexture
    this.envTexture = this.resources.items.royal_esplanade
    this.envTexture.mapping = THREE.EquirectangularReflectionMapping

    // blurries
    this.scene.backgroundBlurriness = this.params.blurriness
  }

  setDebug = () => {
    if (!this.debug.active) return

    this.debugFolder = this.debug.ui.addFolder('Enironment')
    const debugObject = {
      'Add/Remove Scene Texture': () => {
        if(this.scene.environment === null) {
          this.scene.environment = this.envTexture
          this.scene.background = this.envTexture
        } else {
          this.scene.environment = null
          this.scene.background = new THREE.Color(this.params.backgroundColor)
        }
      },
    }

    this.debugFolder.addColor( this.params, 'backgroundColor' ).onChange( val => {
    	this.scene.background.setHex( this.params.backgroundColor )
    })
    this.debugFolder.add(debugObject, 'Add/Remove Scene Texture')
    this.debugFolder.add( this.params, 'blurriness', 0, 1).onChange( val => {
      this.scene.backgroundBlurriness = this.params.blurriness
    })
  }
}
