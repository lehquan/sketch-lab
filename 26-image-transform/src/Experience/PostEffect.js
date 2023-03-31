import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import Experience from './Experience'
import AfterImage from './World/Effects/AfterImage'
import Bloom from './World/Effects/Bloom';
export default class PostEffect {
  constructor() {
    this.experience = new Experience()
    this.renderer = this.experience.renderer.instance
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug

    this.isSelectiveBloom = false
    this.bloom = null
    this.setEffects()
  }
  setEffects = () => {
    this.composer = new EffectComposer( this.renderer )

    // render pass
    const renderPass = new RenderPass( this.scene, this.camera )
    this.composer.addPass( renderPass )

    // bloom
    // this.bloom = new Bloom(
    //     this.composer,
    //     this.renderer,
    //     renderPass,
    //     this.isSelectiveBloom)

    // afterImage
    new AfterImage(this.composer)
  }
  resize = () => {
    this.composer.setSize(this.sizes.width, this.sizes.height)
    if(this.isSelectiveBloom) this.bloom.resize(this.sizes)
  }
  update = () => {
    this.isSelectiveBloom ? this.bloom.update() : this.composer.render()
  }
}
