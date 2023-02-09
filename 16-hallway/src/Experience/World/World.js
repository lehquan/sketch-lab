import Experience from "../Experience.js"
import HallWay from './HallWay';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.hallway = new HallWay()
    })
  }
  update() {
    if (this.hallway) this.hallway.update()
  }
}