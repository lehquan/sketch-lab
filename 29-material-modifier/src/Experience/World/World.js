import Experience from "../Experience.js"
import MatModifier from './MatModifier';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.modifier = new MatModifier()
    })
  }
  update() {
    if(this.modifier) this.modifier.update()
  }
}
