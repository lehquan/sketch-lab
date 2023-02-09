import Experience from "../Experience.js"
import AnimationBox from './AnimationBox';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.box = new AnimationBox()
    })
  }
  update() {
    if (this.box) this.box.update()
  }
}
