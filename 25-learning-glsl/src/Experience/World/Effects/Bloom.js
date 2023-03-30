import * as THREE from 'three'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer'
import bloomVertex from '../../../shaders/bloom.vert'
import bloomFragment from '../../../shaders/bloom.frag'

export default class Bloom {
  constructor(composer, renderer, renderPass, isSelectiveBloom) {
    this.composer = composer
    this.renderer = renderer
    this.renderPass = renderPass
    this.isSelective = isSelectiveBloom

    this.params = {
      bloomStrength: 1.5,
      bloomThreshold: 0,
      bloomRadius: 0,
      BLOOM_SCENE: 1
    }
    this.setBloom()
  }
  setBloom = () => {
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2( window.innerWidth, window.innerHeight ),
        this.params.bloomStrength,
        this.params.bloomRadius,
        this.params.bloomThreshold )
    this.composer.addPass(bloomPass)

    if(this.isSelective) this.setCustomBloomPass()
  }
  setCustomBloomPass = () => {
    // de-active renderToScreen of bloomComposer
    this.composer.renderToScreen = false

    const finalPass = new ShaderPass(
        new THREE.ShaderMaterial( {
          uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: this.composer.renderTarget2.texture }
            // bloomTexture: { value: this.bloomComposer.readBuffer.texture }
          },
          vertexShader: bloomVertex,
          fragmentShader: bloomFragment,
          defines: {}
        } ), 'baseTexture'
    );
    finalPass.needsSwap = true

    this.finalComposer = new EffectComposer( this.renderer )
    this.finalComposer.addPass( this.renderPass )
    this.finalComposer.addPass( finalPass )
  }
  resize = sizes => {
    if(this.finalComposer) this.finalComposer.setSize(sizes.width, sizes.height)
  }
  renderBloom = () => {
    if(this.composer) this.composer.render()
  }
  renderFinal = () => {
    if(this.finalComposer) this.finalComposer.render()
  }
  update = () => {
    this.renderBloom()
    if(this.isSelective) this.renderFinal()
  }
}
