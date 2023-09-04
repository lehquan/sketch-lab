import Experience from "../Experience.js"
import MeshoptKTX from './MeshoptKTX';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.meshopt = new MeshoptKTX()
    })
  }
  update() {
    if (this.meshopt) this.meshopt.update()
  }
}
