import Experience from "../Experience.js"
import CameraTransform from './CameraTransform'
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.transform = new CameraTransform()
    })
  }
  update() {
    if (this.transform) this.transform.update()
  }
}
