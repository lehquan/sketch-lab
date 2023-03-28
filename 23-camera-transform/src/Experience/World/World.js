import Experience from "../Experience.js"
import CameraTransform from './CameraTransform'
import OrbitMovement from './OrbitMovement';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      // new CameraTransform()
      this.orbitMovement = new OrbitMovement()
    })
  }
  update() {
    if (this.orbitMovement) this.orbitMovement.update()
  }
}
