import * as THREE from 'three'
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.params = {
      backgroundColor: 0x1D267D, //0x0E2F58, // 0x242426, //0x000000, //0x262626,
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
    // this.scene.add( new THREE.AmbientLight(0x222222))
    // this.scene.add( new THREE.DirectionalLight(0xffffff, 1))

    // backgroundColor
    this.scene.background = new THREE.Color(this.params.backgroundColor)

    // sceneTexture
    this.envTexture = this.resources.items.royal_esplanade
    this.envTexture.mapping = THREE.EquirectangularReflectionMapping
    this.scene.environment = this.envTexture

    // blurries
    this.scene.backgroundBlurriness = this.params.blurriness

    // fog
    // this.scene.fog = new THREE.Fog(0x242426, 20, 100)
    this.scene.fog = new THREE.Fog(this.params.backgroundColor, 20, 100)
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
