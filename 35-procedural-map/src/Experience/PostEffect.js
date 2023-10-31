import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/addons/shaders/FXAAShader';
import { BleachBypassShader } from 'three/addons/shaders/BleachBypassShader';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader';
import { ColorCorrectionShader } from 'three/addons/shaders/ColorCorrectionShader';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass';
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
      bloomStrength: 0.2,
      bloomThreshold: 0,
      bloomRadius: 0.55
    }
    this.effectFXAAPass = null
    this.composer = null

    this.setEffect()
  }
  setEffect = () => {

    const renderPass = new RenderPass(this.scene, this.camera)
    const effectBleachPass = new ShaderPass(BleachBypassShader)
    const effectColorPass = new ShaderPass(ColorCorrectionShader)
    this.effectFXAAPass = new ShaderPass(FXAAShader)
    const gammaPass = new ShaderPass(GammaCorrectionShader)

    this.effectFXAAPass.uniforms.resolution.value.set(
        1 / this.sizes.width,
        1 / this.sizes.height
    );
    effectBleachPass.uniforms.opacity.value = 0.2;
    effectColorPass.uniforms.powRGB.value.set(1.4, 1.45, 1.45);
    effectColorPass.uniforms.mulRGB.value.set(1.1, 1.1, 1.1);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
    );
    bloomPass.threshold = this.params.bloomThreshold;
    bloomPass.strength = this.params.bloomStrength;
    bloomPass.radius = this.params.bloomRadius;

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(renderPass)
    this.composer.addPass(this.effectFXAAPass)
    this.composer.addPass(effectBleachPass)
    this.composer.addPass(effectColorPass)
    this.composer.addPass(gammaPass)
    this.composer.addPass(bloomPass)
  }
  resize = () => {
    this.effectFXAAPass.uniforms[ 'resolution' ].value.set( 1 / ( this.sizes.width * window.devicePixelRatio ), 1 / ( this.sizes.width * window.devicePixelRatio ) );
    this.composer.setSize(this.sizes.width, this.sizes.height)
  }
  update = () => {
    if(this.composer) this.composer.render(0.01)
  }
}
