import * as THREE from "three"
import Sizes from "../utils/Sizes.js"
import Time from "../utils/Time.js"
import Camera from "./Camera.js"
import Renderer from "./Renderer.js"
import World from "./World/World.js"
import Resources from "../utils/Resources.js"
import Sound from './Sound';
import Stats from "../utils/Stats.js"

import sources from "./sources.js"
import Environment from './Environment'
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

    /**Canvas & DOM */
    this.createDOM()
    this.canvas = document.querySelector("#experience")

    /**Setup Classes */
    this.debug = new Debug()
    this.stats = new Stats()
    this.sizes = new Sizes()
    this.time = new Time()
    this.mouse = new Mouse()
    this.resources = new Resources(sources)

    this.scene = new THREE.Scene()
    this.camera = new Camera()
    this.sound = new Sound() // sound needs camera
    this.environment = new Environment()
    this.renderer = new Renderer()
    this.world = new World()

    this.isLoaded = false

    this.sizes.on("resize", () => this.resize())
    this.time.on("tick", () => this.update())

    // Wait for resources
    this.resources.on("ready", () => {
      this.isLoaded = true
    })
  }

  createDOM = () => {
    // overlay
    const overlay = document.createElement('div')
    overlay.id = 'overlay'
    document.body.appendChild(overlay)

    const startButton = document.createElement('button')
    startButton.id = 'startButton'
    startButton.innerHTML = 'ENTER'
    startButton.addEventListener('click', () => {
      overlay.remove()

      this.playAmbient()
      this.camera.transformCamera()
      window.dispatchEvent(new Event(EVT.START_EXPERIENCE))
    })
    overlay.appendChild(startButton)

    const msg = document.createElement('p')
    msg.innerHTML = 'Use headphone for better experience'
    overlay.appendChild(msg)

    // canvas
    const _canvas = document.createElement("canvas")
    _canvas.id = 'experience'
    document.body.appendChild(_canvas)

    // right wrapper
    const rightWrapper = document.createElement('div')
    rightWrapper.classList.add('rightWrapper')
    document.body.appendChild(rightWrapper)

    for(let i=1;i<3; i++) {
      const page = document.createElement('div')
      page.innerHTML = i
      page.classList.add('pageNum')
      page.id = 'model-'+i

      page.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent(EVT.OPEN_STATUE, { detail: i}))
      })
      rightWrapper.appendChild(page)
    }

    // footer
    const footer = document.createElement("div")
    footer.classList.add('footer')
    document.body.appendChild(footer)

    const note1 = document.createElement('p')
    note1.innerHTML = '3D Models: '
    footer.appendChild(note1)

    const linkNote1 = document.createElement('a')
    linkNote1.innerHTML = 'Figure of Dancer, '
    linkNote1.href = 'https://skfb.ly/6QWIL'
    linkNote1.target = 'blank'
    note1.appendChild(linkNote1)
    const linkNote2 = document.createElement('a')
    linkNote2.innerHTML = 'Statue of Liberty'
    linkNote2.href = 'https://skfb.ly/6wwZQ'
    linkNote2.target = 'blank'
    note1.appendChild(linkNote2)

    const note2 = document.createElement('p')
    note2.innerHTML = 'Sounds: '
    footer.appendChild(note2)

    const linkNote3 = document.createElement('a')
    linkNote3.innerHTML = 'mausoleodiaugusto.it'
    linkNote3.href = 'http://experience.mausoleodiaugusto.it/en/intro'
    linkNote3.target = 'blank'
    note2.appendChild(linkNote3)

    // const iconWrapper = document.createElement('div')
    // iconWrapper.classList.add('iconWrapper')
    // footer.appendChild(iconWrapper)
    //
    // const headphone = document.createElement('img')
    // headphone.src = 'assets/headphone.svg'
    // iconWrapper.appendChild(headphone)
  }

  /**
   * Play ambient sound when enter experience
   */
  playAmbient = () => {
    if(!this.isLoaded) {
      console.warn('Sound is not ready yet.')
      return;
    }

    const buffer = this.resources.items.ambientSound
    this.sound.play(buffer, true, 0.5)
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    /**Begin analyzing frame */
    this.stats.active && this.stats.beforeRender()

    /**update everything */
    this.camera.update()
    this.world.update()
    this.renderer.update()
    this.environment.update()

    /**Finish analyzing frame */
    this.stats.active && this.stats.afterRender()
  }

  destroy() {
    /**Clear Event Emitter*/
    this.sizes.off("resize")
    this.time.off("tick")

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
    this.sound.dispose()

    if (this.debug.active) {
      this.debug.ui.destroy()
    }

    if (this.stats.active) {
      this.stats.ui.destroy()
    }
  }
}
