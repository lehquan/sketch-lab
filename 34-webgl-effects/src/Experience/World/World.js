import Experience from "../Experience.js"
import DualLight from './DualLight'
import Lantern from './Lantern'
import Stars from './Stars';
import Snow from './Snow'
import Frost from './Frost';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.dual = new DualLight()
      // this.lantern = new Lantern()
      // this.stars = new Stars()
      this.fallingSnow = new Snow()
      this.frost = new Frost()
    })
  }
  update() {
    if (this.dual) this.dual.update()
    // if (this.lantern) this.lantern.update()
    // if (this.stars) this.stars.update()
    if (this.fallingSnow) this.fallingSnow.update()
    if (this.frost) this.frost.update()
  }
}
