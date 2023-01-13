import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import Experience from './Experience'
import { EFFECTS, EVT } from '../utils/contains';
import postVertex from '../shaders/post.vert'
import postFragment from '../shaders/post.frag'

export default class PostEffect {
  constructor() {
    this.experience = new Experience()
    this.renderer = this.experience.renderer.instance
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug

    this.mouse = new THREE.Vector2()
    this.followMouse = new THREE.Vector2()
    this.prevMouse = new THREE.Vector2()

    this.targetSpeed = 0
    this.speed = 0
    this.time = 0
    this.effects = [ EFFECTS.COLORFUL, EFFECTS.ZOOM, EFFECTS.GRAIN ]
    this.effect = { 'Post Effect': EFFECTS.COLORFUL }

    this.onMouseMove()
    this.setEffect()
  }
  onMouseMove = () => {
    document.addEventListener(EVT.MOUSE_MOVE, (e) => {
      this.mouse.x = ( e.clientX / window.innerWidth ) ;
      this.mouse.y = 1. - ( e.clientY/ window.innerHeight );
    })
  }
  getSpeed = () => {
    this.speed = Math.sqrt( (this.prevMouse.x- this.mouse.x)**2 + (this.prevMouse.y- this.mouse.y)**2 )

    this.targetSpeed -= 0.1*(this.targetSpeed - this.speed);
    this.followMouse.x -= 0.1*(this.followMouse.x - this.mouse.x);
    this.followMouse.y -= 0.1*(this.followMouse.y - this.mouse.y);

    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }
  setEffect = () => {
    this.composer = new EffectComposer(this.renderer)
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    // custom shader pass
    const myEffect = {
      uniforms: {
        tDiffuse: { value: null },
        uResolution: { value: new THREE.Vector2(1.,window.innerHeight/window.innerWidth) },
        uMouse: { value: new THREE.Vector2(-10,-10) },
        uVelocity: { value: 0 },
        uScale: { value: 0 },
        uType: { value: 0 },
        uTime: { value: 0 }
      },
      vertexShader: postVertex,
      fragmentShader: postFragment
    }
    this.customPass = new ShaderPass(myEffect)
    this.customPass.renderToScreen = true
    this.composer.addPass(this.customPass)

    //debug
    if(this.debug.active) {
      this.debug.ui.add( this.effect, 'Post Effect' ).options(this.effects).onChange(val => {
        switch (val) {
          case EFFECTS.COLORFUL:
            this.customPass.uniforms.uType.value = 0;
            break;
          case EFFECTS.ZOOM:
            this.customPass.uniforms.uType.value = 1;
            break;
          case EFFECTS.GRAIN:
            this.customPass.uniforms.uType.value = 2;
            break;
        }
      });
    }
  }
  resize = () => {
    this.customPass.uniforms.uResolution.value.y = this.sizes.height / this.sizes.width
    this.composer.setSize(window.innerWidth, window.innerHeight)
  }
  update = () => {
    this.getSpeed()

    if (this.customPass) {
      this.customPass.uniforms.uTime.value = performance.now() / 1000
      this.customPass.uniforms.uMouse.value = this.followMouse // this.mouse
      this.customPass.uniforms.uVelocity.value = Math.min(this.targetSpeed, 0.05);
      this.targetSpeed *=0.999;
    }

    if(this.composer) this.composer.render()
  }
}
