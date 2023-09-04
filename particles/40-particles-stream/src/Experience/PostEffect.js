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
import {OutputPass} from 'three/addons/postprocessing/OutputPass';
export default class PostEffect {
  constructor() {
    this.experience = new Experience()
    this.renderer = this.experience.renderer.instance
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug

    this.bloomPass = null
    this.params = {
      exposure: 1,
      bloomStrength: 0.4,
      bloomThreshold: 0,
      bloomRadius: 0
    }
    this.composer = null

    this.setEffect()
    this.setDebug()
  }
  setDebug = () => {
    if (!this.debug.active) return

    this.debug.ui.add(this.params, 'bloomStrength', 0.2, 0.6, 0.01).onChange(val => {
      this.bloomPass.strength = val
    })
  }
  setEffect = () => {
    const renderPass = new RenderPass(this.scene, this.camera)

    this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
    );
    this.bloomPass.threshold = this.params.bloomThreshold;
    this.bloomPass.strength = this.params.bloomStrength;
    this.bloomPass.radius = this.params.bloomRadius;

    const outputPass = new OutputPass();

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(renderPass)
    this.composer.addPass(this.bloomPass)
    this.composer.addPass( outputPass );
  }
  resize = () => {
    this.composer.setSize(this.sizes.width, this.sizes.height)
  }
  update = () => {
    if(this.composer) this.composer.render(0.01)
  }
}
