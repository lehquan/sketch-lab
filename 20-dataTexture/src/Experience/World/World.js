import Experience from "../Experience.js"
import Koi from './Koi';
import Lantern from './Lantern';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.koi = new Koi()
      this.lantern = new Lantern()
    })
  }
  update() {
    if (this.koi) this.koi.update()
    if (this.lantern) this.lantern.update()
  }
}
