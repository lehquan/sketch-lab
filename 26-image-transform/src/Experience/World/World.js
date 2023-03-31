import Experience from "../Experience.js"
import ImageExtrude from './ImageExtrude';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.extrude = new ImageExtrude()
    })
  }
  update() {
    if(this.extrude) this.extrude.update()
  }
}
