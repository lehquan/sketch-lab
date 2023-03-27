import Experience from "../Experience.js"
import MakeZoom from './MakeZoom';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.zoom = new MakeZoom()
    })
  }
  update() {
    if (this.zoom) this.zoom.update()
  }
}
