import Experience from "../Experience.js"
import ScifiGirl from './ScifiGirl';
import Crystal from './Crystal';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.scifiGirl = new ScifiGirl()
      this.crystal = new Crystal()
    })
  }
  update() {
    if (this.scifiGirl) this.scifiGirl.update()
    if (this.crystal) this.crystal.update()
  }
}
