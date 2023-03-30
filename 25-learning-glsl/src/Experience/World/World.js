import Experience from "../Experience.js"
import Grass from './Grass';
import Outline from './Outline';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      // this.grass = new Grass()
      new Outline()
    })
  }
  update() {
    // if(this.grass) this.grass.update()
  }
}
