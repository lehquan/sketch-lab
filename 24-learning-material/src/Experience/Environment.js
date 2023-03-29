import * as THREE from 'three'
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.bgColorFolder = null
    this.params = {
      backgroundColor: 0x262626,
      blurriness: 0,
      isTextureEnabled: false
    }

    // Wait for resources
    this.resources.on("ready", () => {
      this.setEnv()
      this.setDebug()
    })
  }

  setEnv = () => {
    // backgroundColor
    this.scene.background = new THREE.Color(this.params.backgroundColor)

    // sceneTexture
    this.envTexture = this.resources.items.royal_esplanade
    this.envTexture.mapping = THREE.EquirectangularReflectionMapping
    if(this.params.isTextureEnabled) this.scene.environment = this.envTexture

    // blurries
    this.scene.backgroundBlurriness = this.params.blurriness
  }

  setDebug = () => {
    if (!this.debug.active) return

    const debugFolder = this.debug.ui.addFolder('Enironment')
    const debugObject = {
      'Add/Remove Scene Texture': () => {
        if(this.scene.environment === null) { // set HDRI
          if(this.bgColorFolder) {
            this.bgColorFolder.destroy()
            this.bgColorFolder = null
            this.params.backgroundColor = 0x262626
          }

          this.scene.environment = this.envTexture
          this.scene.background = this.envTexture
          this.blurFolder = debugFolder.add( this.params, 'blurriness', 0, 1).onChange( val => {
            this.scene.backgroundBlurriness = this.params.blurriness
          })
        }
        else { // set bgColor
          this.scene.environment = null
          if (this.blurFolder) {
            this.blurFolder.destroy()
            this.blurFolder = null
          }

          this.scene.background = new THREE.Color(this.params.backgroundColor)
          this.bgColorFolder = debugFolder.addColor( this.params, 'backgroundColor' ).onChange( val => {
            this.scene.background.setHex( this.params.backgroundColor )
          })
        }
      },
    }

    this.bgColorFolder = debugFolder.addColor( this.params, 'backgroundColor' ).onChange( val => {
      this.scene.background.setHex( this.params.backgroundColor )
    })
    debugFolder.add(debugObject, 'Add/Remove Scene Texture')
    debugFolder.close()
  }
}
