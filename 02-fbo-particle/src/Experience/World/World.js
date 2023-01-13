import Experience from "../Experience.js"
import FboSimulation from './FboSimulation';
import VertexParticle from './VertexParticle';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources
    this.isVertexSimulation = true
    this.isFBOSimulation = false

    // Wait for resources
    this.resources.on("ready", () => {

      // debug
      if (this.debug.active) {
        this.vertexFolder = this.debug.ui.addFolder('Vertex Animation')
        this.fboFolder = this.debug.ui.addFolder('GPGPU')
        const vertexDebug = { 'Active': true }
        const fboDebug = { 'Active' : false }

        this.vertexFolder.add(vertexDebug, 'Active').onChange(val => {
          val ? this.isVertexSimulation = true : this.isVertexSimulation = false
        })
        this.fboFolder.add(fboDebug, 'Active').onChange(val => {
          val ? this.isFBOSimulation = true : this.isFBOSimulation = false
        })
      }

      this.vertexParticle = new VertexParticle(this.vertexFolder)
      this.fbo = new FboSimulation()
    })
  }
  update() {
    if (this.vertexParticle) this.vertexParticle.update(this.isVertexSimulation)
    if (this.fbo) this.fbo.update(this.isFBOSimulation)
  }
}
