import Experience from "../Experience.js"
import SoftShadow from './SoftShadow'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.softShadow = new SoftShadow()
    })
  }
  update() {
    if (this.softShadow) this.softShadow.update()
  }
}
