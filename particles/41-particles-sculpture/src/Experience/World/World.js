import Experience from "../Experience.js"
import Sculpture from './Sculpture';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.sculpture = new Sculpture()
    })
  }
  update() {
    if (this.sculpture) this.sculpture.update()
  }
}
