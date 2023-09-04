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
import Mouse from '../utils/Mouse';
import Debug from '../utils/Debug';
import PostEffect from './PostEffect';

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

    /**Canvas & DOM*/
    this.createDOM()
    this.canvas = document.querySelector('#experience')

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
    window.renderer = this.renderer.instance
    // this.postEffect = new PostEffect()
    this.world = new World()

    this.sizes.on("resize", () => this.resize())
    // this.time.on("tick", () => this.update())
    this.tick()
  }

  createDOM = ()=> {
    // canvas
    const _canvas = document.createElement("canvas")
    _canvas.id = 'experience'
    document.body.appendChild(_canvas)

    const footer = document.createElement('div')
    footer.classList.add('footer')
    document.body.appendChild(footer)

    const note1 = document.createElement('p')
    note1.innerHTML = 'Original post: '
    footer.appendChild(note1)

    const linkNote1 = document.createElement('a')
    linkNote1.innerHTML = 'Flying lanterns and Koi fish by Paul West'
    linkNote1.href = 'https://codepen.io/prisoner849/pen/WNQNdpv?editors=1010'
    linkNote1.target = 'blank'
    note1.appendChild(linkNote1)
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
    // this.postEffect.resize()
  }

  update() {
    /**Begin analyzing frame */
    this.stats.active && this.stats.beforeRender()

    /**update everything */
    this.camera.update()
    this.world.update()
    this.renderer.update() // Don't use this if using PostProcessing
    // if (this.postEffect) this.postEffect.update()

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
