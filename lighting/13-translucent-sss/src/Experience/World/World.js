import Experience from "../Experience.js"
import SSS from './sss';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.sss = new SSS()
    })
  }
  update() {
    if (this.sss) this.sss.update()
  }
}
