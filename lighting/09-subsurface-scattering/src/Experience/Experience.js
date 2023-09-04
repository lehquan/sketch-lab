import * as THREE from "three"
import Sizes from "../utils/Sizes.js"
// import Time from "../utils/Time.js"
import Camera from "./Camera.js"
import Renderer from "./Renderer.js"
import World from "./World/World.js"
import Resources from "../utils/Resources.js"
import Stats from "../utils/Stats.js"

import sources from "./sources.js"
import Environment from './Environment'
import PostEffect from './PostEffect';
import Mouse from '../utils/Mouse';
import Debug from '../utils/Debug';
import { EVT } from '../utils/contains';

let instance = null

export default class Experience {
  constructor() {
    /**Singleton */
    if (instance) {
      return instance
    }
    instance = this

    /**Global Access */
    window.experience = this
  
    /**DOM and Canvas*/
    this.createDOM()
    this.canvas = document.querySelector("#experience")

    /**Setup Classes */
    this.debug = new Debug()
    this.stats = new Stats()
    this.sizes = new Sizes()
    // this.time = new Time()
    this.mouse = new Mouse()
    this.resources = new Resources(sources)

    this.scene = new THREE.Scene()
    this.environment = new Environment()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.postEffect = new PostEffect()
    this.world = new World()

    this.sizes.on(EVT.RESIZE, () => this.resize())
    // this.time.on("tick", () => this.update())
    this.tick()
  }
  
  createDOM = () => {
    // canvas
    const _canvas = document.createElement("canvas")
    _canvas.id = 'experience'
    document.body.appendChild(_canvas)
    
    const footer = document.createElement("div")
    footer.classList.add('footer')
    document.body.appendChild(footer)
    
    const note = document.createElement('p')
    note.innerHTML = '3D Model: '
    footer.appendChild(note)
    const link1 = document.createElement('a')
    link1.innerHTML = 'Angelica, '
    link1.href = 'https://skfb.ly/6ouNX'
    link1.target = 'blank'
    note.appendChild(link1)
 
    note.innerHTML += 'HDR: '
    const link2 = document.createElement('a')
    link2.innerHTML = 'PolyHeaven'
    link2.href = 'https://polyhaven.com/a/future_parking'
    link2.target = 'blank'
    note.appendChild(link2)
  
    const msg = document.createElement('p')
    msg.classList.add('msg')
    msg.innerHTML = 'Take a  closer look'
    footer.appendChild(msg)
  }
  resize() {
    this.camera.resize()
    this.renderer.resize()
    this.postEffect.update()
  }

  update() {
    /**Begin analyzing frame */
    this.stats.active && this.stats.beforeRender()

    /**update everything */
    this.camera.update()
    this.world.update()
    this.environment.update()
    // this.renderer.update() // Don't use this if using PostProcessing
    if(this.postEffect) this.postEffect.update()

    /**Finish analyzing frame */
    this.stats.active && this.stats.afterRender()
  }
  
  tick = () => {
    requestAnimationFrame( this.tick )
    this.update()
  }

  destroy() {
    /**Clear Event Emitter*/
    this.sizes.off("resize")
    // this.time.off("tick")

    /**Traverse the whole scene and check if it's a mesh */
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()

        /**Loop through the material properties */
        for (const key in child.material) {
          const value = child.material[key]

          /**Test if there is a dispose function */
          if (value && typeof value.dispose === "function") {
            value.dispose()
          }
        }
      }
    })

    this.camera.controls.dispose()
    this.renderer.instance.dispose()

    if (this.debug.active) {
      this.debug.ui.destroy()
    }

    if (this.stats.active) {
      this.stats.ui.destroy()
    }
  }
}
