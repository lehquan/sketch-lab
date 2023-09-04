import Experience from "../Experience.js"
import Glowing from './Glowing';
import Skull from './Skull';
import Petal from './Petal';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.glowing = new Glowing()
      this.glowingMat = this.glowing.material

      this.skull = new Skull(this.glowingMat)
      this.petal = new Petal()
    })
  }
  update() {
    if (this.skull) this.skull.update();
    if (this.petal) this.petal.update();
  }
}
