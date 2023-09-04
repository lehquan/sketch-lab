import Experience from "../Experience.js"
import Blending from './Blending';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.blending = new Blending()
    })
  }
  update() {
    if(this.blending) this.blending.update()
  }
}
