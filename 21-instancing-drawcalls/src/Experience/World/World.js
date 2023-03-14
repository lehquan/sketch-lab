import Experience from "../Experience.js"
import GlowingTree from './GlowingTree';
import Birds from './Birds';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      // this.birds = new Birds()
      this.spheres = new GlowingTree()
    })
  }
  update() {
    // if (this.birds) this.birds.update()
    if (this.spheres) this.spheres.update()
  }
}
