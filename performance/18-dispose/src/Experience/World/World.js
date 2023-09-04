import Experience from "../Experience.js"
import Models from './Models';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.fox = new Models()
    })
  }
  update() {
    if (this.fox) this.fox.update()
  }
}
