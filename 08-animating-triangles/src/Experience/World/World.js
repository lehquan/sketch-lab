import Experience from "../Experience.js"
import Statue from './Statue';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.statue = new Statue()
    })
  }
  update() {
    if (this.statue) this.statue.update()
  }
}
