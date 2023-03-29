import Experience from "../Experience.js"
import SnowFlake from './SnowFlake'
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      new SnowFlake()
    })
  }
  update() {
    // if (this.orbitMovement) this.orbitMovement.update()
  }
}
