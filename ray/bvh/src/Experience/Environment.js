import {
  AmbientLight,
  Color,
  DirectionalLight,
  EquirectangularReflectionMapping,
} from 'three';
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.params = {
      backgroundColor: 0x262626,
      blurriness: 0.5
    }

    // Wait for resources
    this.resources.on("ready", () => {
      this.setEnv()
      this.setDebug()
    })
  }

  setEnv = () => {
    this.scene.add( new AmbientLight(0xffffff, 2))
    this.scene.add( new DirectionalLight(0xffffff, 2))

    // scene background and texture
    this.envTexture = this.resources.items.royal_esplanade
    this.envTexture.mapping = EquirectangularReflectionMapping
    this.scene.environment = this.envTexture
    this.scene.background = this.envTexture
    // this.scene.background = new Color(this.params.backgroundColor)

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
          this.scene.background = new Color(this.params.backgroundColor)
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
