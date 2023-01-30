import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer'
import { RenderPass } from 'three/addons/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader';
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
      bloomStrength: 0.4,
      bloomThreshold: 0,
      bloomRadius: 0,
      rgbShiftIntensity: 0.001
    }
    this.setEffect()
  }
  setEffect = () => {
    this.composer = new EffectComposer(this.renderer)

    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    const rgbShiftPass = new ShaderPass(RGBShiftShader)
    rgbShiftPass.uniforms.amount.value = this.params.rgbShiftIntensity
    this.composer.addPass(rgbShiftPass)

    // const gammaCorrectionShader = new ShaderPass(GammaCorrectionShader)
    // this.composer.addPass(gammaCorrectionShader)

    // this.bloomPass = new UnrealBloomPass( new THREE.Vector2( this.sizes.width, this.sizes.height ), 1.5, 0.4, 0.85 )
    // this.bloomPass.threshold = this.params.bloomThreshold
    // this.bloomPass.radius = this.params.bloomRadius
    this.bloomPass = new UnrealBloomPass()
    this.bloomPass.strength = this.params.bloomStrength
    this.composer.addPass(this.bloomPass)
  }
  resize = () => {
    this.composer.setSize(this.sizes.width, this.sizes.height)
    this.composer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }
  update = () => {
    if(this.composer) this.composer.render()
  }
}
