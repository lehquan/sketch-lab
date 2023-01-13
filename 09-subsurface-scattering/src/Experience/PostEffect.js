import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/addons/shaders/FXAAShader';
import { BleachBypassShader } from 'three/addons/shaders/BleachBypassShader';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader';
import { ColorCorrectionShader } from 'three/addons/shaders/ColorCorrectionShader';
import Experience from './Experience'

export default class PostEffect {
  constructor() {
    this.experience = new Experience()
    this.renderer = this.experience.renderer.instance
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug

    this.effectFXAA = null
    this.composer = null
    
    this.setEffect()
  }
  setEffect = () => {
    this.composer = new EffectComposer(this.renderer)
    
    const renderModel = new RenderPass(this.scene, this.camera)
    const effectBleach = new ShaderPass(BleachBypassShader)
    const effectColor = new ShaderPass(ColorCorrectionShader)
    this.effectFXAA = new ShaderPass(FXAAShader)
    const gammaPass = new ShaderPass(GammaCorrectionShader)
  
    this.effectFXAA.uniforms.resolution.value.set(
        1 / this.sizes.width,
        1 / this.sizes.height
    );
    effectBleach.uniforms.opacity.value = 0.2;
    effectColor.uniforms.powRGB.value.set(1.4, 1.45, 1.45);
    effectColor.uniforms.mulRGB.value.set(1.1, 1.1, 1.1);
    
    this.composer.addPass(renderModel)
    this.composer.addPass(this.effectFXAA)
    this.composer.addPass(effectBleach)
    this.composer.addPass(effectColor)
    this.composer.addPass(gammaPass)
  }
  resize = () => {
    this.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / ( this.sizes.width * window.devicePixelRatio ), 1 / ( this.sizes.width * window.devicePixelRatio ) );
    this.composer.setSize(this.sizes.width, this.sizes.height)
  }
  update = () => {
    if(this.composer) this.composer.render(0.01)
  }
}
