import Experience from "../Experience.js"
import Glowing from './Glowing';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.glowing = new Glowing()
    })
  }
  update() {
    if (this.glowing) this.glowing.update()
  }
}
