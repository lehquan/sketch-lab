import Experience from "../Experience.js"
import FboSimulation from './FboSimulation';
import VertexParticle from './VertexParticle';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    this.useVertexAnimation = false
    this.useFBO = true

    // Wait for resources
    this.resources.on("ready", () => {
      if(!this.debug.active) return

      const debugFolder = this.debug.ui.addFolder('Vertex Animation / FBO')
      const debugObject = {
        'Skull Model': false,
        'Use FBO': this.useFBO,
        'Use Vertex Animation': this.useVertexAnimation
      }
      debugFolder.add(debugObject, 'Use Vertex Animation').onChange(val => {
        if(val){
          this.useVertexAnimation = true
          // this.useFBO = false
        }
        else {
          this.useVertexAnimation = false
          // this.useFBO = true
        }
      })
      debugFolder.add(debugObject, 'Use FBO').onChange(val => {
        // val ? this.useFBO = true : this.useFBO = false
        if(val){
          // this.useVertexAnimation = false
          this.useFBO = true
        }
        else {
          this.useFBO = false
          // this.useVertexAnimation = true
        }
      })

      this.vertexParticle = new VertexParticle(this.useVertexAnimation)
      this.fbo = new FboSimulation(this.useFBO)
    })
  }
  update() {
    if (this.vertexParticle) this.vertexParticle.update(this.useVertexAnimation)
    if (this.fbo) this.fbo.update(this.useFBO)
  }
}
