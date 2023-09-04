import Experience from "../Experience.js"
import Particles from './Particles';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.particles = new Particles()
    })
  }
  update() {
    if (this.particles) this.particles.update()
  }
}
