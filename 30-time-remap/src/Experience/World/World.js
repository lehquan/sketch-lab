import Experience from "../Experience.js"
import Remap from './Remap';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.remap = new Remap()
    })
  }
  update() {
    if (this.remap) this.remap.update()
  }
}
