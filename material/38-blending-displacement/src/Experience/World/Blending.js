import { DoubleSide, Mesh, PlaneGeometry, ShaderMaterial } from 'three'
import Experience from '../Experience'
import blendVertex from '../../shaders/blend.vert'
import blendFragment from '../../shaders/blend.frag'
import {EVT} from '../../utils/contains';
import Scroll from './Scroll';

export default class Blending {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.scroll = new Scroll()

    this.scrollWeight = 800

    this.addTextures()
    this.setPlaneToy()
  }
  addTextures = () => {
    this.textures = []

    this.textures.push(this.resources.items.A) // 500
    this.textures.push(this.resources.items.B) // 1000
    this.textures.push(this.resources.items.C) // 1500
    this.textures.push(this.resources.items.D) // 2000
    this.textures.push(this.resources.items.E) // 2500

    this.current = this.textures[0]
    this.next = this.textures[1]
  }
  setPlaneToy = () => {
    const geometry = new PlaneGeometry(4.75, 7, 4, 4 )
    this.uniforms = {
      uBlendFactor: { type: 'f', value: 0.0},
      uDisplacementFactor: { type: 'f', value: 0.3 },
      uNext: { type: 't', value: this.textures[1]},
      uCurrent: { type: 't', value: this.textures[0]},
    }
    const material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: blendVertex,
      fragmentShader: blendFragment,
      side: DoubleSide
    })

    const plane = new Mesh(geometry, material)
    this.scene.add(plane)
  }
  updateTexture = pos => {
    if(this.current !== this.textures[Math.floor(pos / this.scrollWeight)]) {
      this.current = this.textures[Math.floor(pos / this.scrollWeight)]
      this.uniforms.uCurrent.value = this.current
    }

    if (this.next !== this.textures[Math.floor(pos / this.scrollWeight) + 1]) {
      this.next = this.textures[Math.floor(pos / this.scrollWeight) + 1]
      this.uniforms.uNext.value = this.next
    }
  }
  update = () => {
    this.scroll.update()

    // Find the next target to stop scrolling
    let scrollTarget = (Math.floor((this.scroll.scrollPos + this.scrollWeight * 0.5) / this.scrollWeight)) * this.scrollWeight
    this.scroll.snap(scrollTarget) // Snap at scrollTarget
    console.log(scrollTarget)

    // Roll back the scroll position at the beginning
    if(scrollTarget === this.scrollWeight * this.textures.length) {
      this.scroll.scrollPos = 0
    }

    // Don't allow scrolling past the end
    if(this.scroll.scrollPos < 0) {
      this.scroll.scrollPos = 0;
    }

    // Update the texture for the current scroll position
    if(this.scroll.scrollPos > 0 && this.scroll.scrollPos < this.scrollWeight * this.textures.length - 1) {
      this.updateTexture(this.scroll.scrollPos)
      this.uniforms.uBlendFactor.value = (this.scroll.scrollPos % this.scrollWeight) / this.scrollWeight
    }

  }
}
