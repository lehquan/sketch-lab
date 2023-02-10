import Experience from "../Experience.js"
import Koi from './Koi';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.koi = new Koi()
    })
  }
  update() {
    if (this.koi) this.koi.update()
  }
}
