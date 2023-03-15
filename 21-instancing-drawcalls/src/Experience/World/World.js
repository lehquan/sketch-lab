import Experience from "../Experience.js"
import GlowingTree from './GlowingTree';
import Birds from './Birds';
import Crystal from './Crystal';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      // this.birds = new Birds()
      this.spheres = new GlowingTree()
      this.crystal = new Crystal()
    })
  }
  update() {
    // if (this.birds) this.birds.update()
    if (this.spheres) this.spheres.update()
    if (this.crystal) this.crystal.update()
  }
}
