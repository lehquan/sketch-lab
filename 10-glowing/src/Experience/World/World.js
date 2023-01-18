import Experience from "../Experience.js"
import Glowing from './Glowing';
import Petal from './Petal';
import Snow from './Snow';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.glowing = new Glowing()
      // this.petal = new Petal()
      this.snow = new Snow()
    })
  }
  update() {
    if (this.glowing) this.glowing.update();
    if (this.snow) this.snow.update();
    // if (this.petal) this.petal.update();
  }
}
