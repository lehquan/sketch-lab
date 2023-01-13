import Experience from "../Experience.js"
import Portal from './Portal'
import Horizon from './Horizon';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.portal = new Portal()
      this.horizon = new Horizon()
    })
  }
  update() {
    if (this.portal) this.portal.update()
    if (this.horizon) this.horizon.update()
  }
}
