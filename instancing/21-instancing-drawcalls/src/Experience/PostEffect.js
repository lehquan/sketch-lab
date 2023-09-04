import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
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
      bloomStrength: 1.0,
      bloomThreshold: 0,
      bloomRadius: 0
    }
    this.composer = null

    this.setEffect()
  }
  setEffect = () => {
    const renderPass = new RenderPass(this.scene, this.camera)
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
    this.composer.addPass(bloomPass)
  }
  resize = () => {
    this.composer.setSize(this.sizes.width, this.sizes.height)
  }
  update = () => {
    if(this.composer) this.composer.render()
  }
}
