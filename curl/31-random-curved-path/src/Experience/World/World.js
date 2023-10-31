import Experience from "../Experience.js"
import Garden from './Garden';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.garden = new Garden()
    })
  }
  update() {
    if (this.garden) this.garden.update()
  }
}
