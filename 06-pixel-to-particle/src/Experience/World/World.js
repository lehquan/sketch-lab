import Experience from "../Experience.js"
import FlowerParticles from './FlowerParticles';
import DotMap from './DotMap';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      // this.flowerParticles = new FlowerParticles()
      this.dotMap = new DotMap()
    })
  }
  update() {
    // if (this.flowerParticles) this.flowerParticles.update()
    if (this.dotMap) this.dotMap.update()
  }
}
