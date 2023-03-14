import Experience from "../Experience.js"
import Birds from './Birds';
import PlaneToy from './PlaneToy';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.birds = new Birds()
    })
  }
  update() {
    if (this.birds) this.birds.update()
  }
}
