import Experience from "../Experience.js"
import VaporWave from './VaporWave';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.vaporwave = new VaporWave()
    })
  }
  update() {
    if (this.vaporwave) this.vaporwave.update()
  }
}
