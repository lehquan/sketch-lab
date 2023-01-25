import Experience from "../Experience.js"
import ScifiGirl from './ScifiGirl';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.scifiGirl = new ScifiGirl()
    })
  }
  update() {
    if (this.scifiGirl) this.scifiGirl.update()
  }
}
