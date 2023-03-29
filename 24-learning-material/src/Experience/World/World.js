import Experience from "../Experience.js"
import SnowFlake from './SnowFlake'
import Glass from './Glass';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      // new SnowFlake()
      new Glass()
    })
  }
  update() {
    //
  }
}
