import Experience from "../Experience.js"
import GlowingTree from './GlowingTree';
import Crystal from './Crystal';
import Wave from './Wave';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.spheres = new GlowingTree()
      this.crystal = new Crystal()
      this.wave = new Wave()
    })
  }
  update() {
    if (this.spheres) this.spheres.update()
    if (this.crystal) this.crystal.update()
    if (this.wave) this.wave.update()
  }
}
