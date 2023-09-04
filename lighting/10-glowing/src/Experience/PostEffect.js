import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer'
import { RenderPass } from 'three/addons/postprocessing/RenderPass'
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';
import Experience from './Experience'

export default class PostEffect {
  constructor() {
    this.experience = new Experience()
    this.renderer = this.experience.renderer.instance
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug

    this.params = {
      exposure: 1,
      bloomStrength: 0.8,
      bloomThreshold: 0,
      bloomRadius: 0
    }
    this.setEffect()
  }
  setEffect = () => {
    this.composer = new EffectComposer(this.renderer)

    const renderModel = new RenderPass(this.scene, this.camera)
    this.bloomPass = new UnrealBloomPass( new THREE.Vector2( this.sizes.width, this.sizes.height ), 1.5, 0.4, 0.85 )
    this.bloomPass.threshold = this.params.bloomThreshold
    this.bloomPass.strength = this.params.bloomStrength
    this.bloomPass.radius = this.params.bloomRadius

    this.composer.addPass(renderModel)
    this.composer.addPass(this.bloomPass)
    // this.composer.addPass( new ShaderPass( GammaCorrectionShader ) )

    //
    if(this.debug.active) {
      this.debug.ui.add(this.params, 'bloomStrength', 0.5, 1.5, 0.01).onChange(val => {
        this.bloomPass.strength = val
      })
    }
  }
  resize = () => {
    this.composer.setSize(this.sizes.width, this.sizes.height)
  }
  update = () => {
    if(this.composer) this.composer.render(0.01)
  }
}
