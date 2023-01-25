import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer'
import { RenderPass } from 'three/addons/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';

import vertexShader from '../shaders/bloom.vert'
import fragmentShader from '../shaders/bloom.frag'

import Experience from './Experience'
export default class PostEffect {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.renderer = this.experience.renderer.instance
    this.camera = this.experience.camera.instance
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug

    this.params = {
      exposure: 1,
      bloomStrength: 2,
      bloomThreshold: 0,
      bloomRadius: 0.55
    };
    this.setEffect()
  }
  setEffect = () => {
    this.renderScene = new RenderPass(this.scene, this.camera);

    this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
    );
    this.bloomPass.threshold = this.params.bloomThreshold;
    this.bloomPass.strength = this.params.bloomStrength;
    this.bloomPass.radius = this.params.bloomRadius;

    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.addPass(this.renderScene);
    this.bloomComposer.addPass(this.bloomPass);

    this.finalPass = new ShaderPass(
        new THREE.ShaderMaterial({
          uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          defines: {}
        }),
        "baseTexture"
    );
    this.finalPass.needsSwap = true;

    this.finalComposer = new EffectComposer(this.renderer);
    this.finalComposer.addPass(this.renderScene);
    this.finalComposer.addPass(this.finalPass);
  }
  resize = () => {
    this.bloomComposer.setSize(this.sizes.width, this.sizes.height)
    this.finalComposer.setSize(this.sizes.width, this.sizes.height)
  }
  bloomUpdate = () => {
    this.renderer.setClearColor(0x7B8585)
    this.bloomComposer.render()
  }

  finalUpdate = () => {
    this.renderer.setClearColor(0x7B8585)
    this.finalComposer.render()
  }
}
