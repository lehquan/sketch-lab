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
import Ray from './Ray';

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
    this.isPostRender = false // not using post-processing by default

    /**Canvas*/
    this.initDOM()
    this.canvas = document.querySelector('#experience')
    console.log(`THREE.REVISION: ${THREE.REVISION}`)

    /**Setup Classes */
    this.debug = new Debug()
    this.stats = new Stats()
    this.sizes = new Sizes()
    // this.time = new Time()
    // this.mouse = new Mouse()

    this.scene = new THREE.Scene()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.resources = new Resources(sources) // resources need renderer for meshopt
    new Environment()
    this.world = new World()
    this.postEffect = new PostEffect()
    // this.ray = new Ray(this.camera, this.scene)

    this.sizes.on("resize", () => this.resize())
    // this.time.on("tick", () => this.update())
    this.tick()
  }

  initDOM = () => {
    // canvas
    const _canvas = document.createElement("canvas")
    _canvas.id = 'experience'
    document.body.appendChild(_canvas)

    const footer = document.createElement("div")
    footer.classList.add('footer')
    footer.id = 'footer'
    document.body.appendChild(footer)
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
    this.postEffect.resize()
  }

  update() {
    /**Begin analyzing frame */
    this.stats.active && this.stats.beforeRender()

    /**update everything */
    this.camera.update()
    this.world.update()
    // Don't update this.renderer if using PostProcessing
    this.isPostRender ? this.postEffect.update() : this.renderer.update()

    /**Finish analyzing frame */
    this.stats.active && this.stats.afterRender()
  }

  tick = () => {
    requestAnimationFrame( this.tick )
    this.update()
  }

  /**
   * Traverse the whole {resource} and clean up
   * geometry, material, texture, uniforms and skeleton.
   * @param resource
   */
  dispose = resource => {
    if (resource instanceof THREE.Object3D) {

      resource.traverse(child => {

        // If object is type of SkinnedMesh
        if (child.isSkinnedMesh) {
          child.skeleton.dispose()
        }

        // geometry
        if (child.geometry) child.geometry.dispose()

        // material
        if (child.material) {

          // We have to check if there are any textures on the material
          for (const value of Object.values(child.material)) {
            if (value instanceof THREE.Texture) {
              value.dispose()
            }
          }

          // We also have to check if any uniforms reference textures or arrays of textures
          if (child.material.uniforms) {
            for (const value of Object.values(child.material.uniforms)) {
              if (value) {
                const uniformValue = value.value;
                // if (uniformValue instanceof THREE.Texture || Array.isArray(uniformValue)) {
                if (uniformValue instanceof THREE.Texture ) {
                  uniformValue.dispose()
                }
              }
            }
          }

          // Dispose texture
          child.material.dispose()
        }
      })
    }

    // remove resource
    this.scene.remove(resource)
    console.info(this.renderer.instance.info)
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
