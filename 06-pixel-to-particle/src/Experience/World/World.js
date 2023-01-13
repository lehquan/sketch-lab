import Experience from "../Experience.js"
import Particles from './Particles';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {

      // Original version: https://codepen.io/zadvorsky/pen/VaXqRW
      this.particles = new Particles()
    })
  }
  update() {
    if (this.particles) this.particles.update()
  }
}
