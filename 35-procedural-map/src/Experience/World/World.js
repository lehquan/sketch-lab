import Experience from "../Experience.js"
import ProceduralMap from './ProceduralMap';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.map = new ProceduralMap()
    })
  }
  update() {
    if (this.map) this.map.update()
  }
}
