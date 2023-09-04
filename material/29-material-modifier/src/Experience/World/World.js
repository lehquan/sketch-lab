import Experience from "../Experience.js"
import MatModifier from './MatModifier';
import TestVideo from './TestVideo';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.testVid = new TestVideo()
    })
  }
  update() {
    if(this.testVid) this.testVid.update()
  }
}