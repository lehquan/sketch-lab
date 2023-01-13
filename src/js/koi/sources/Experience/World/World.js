import Experience from "../Experience.js";
import Fox from "./Fox.js";
import Koi from './Koi';

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources
    this.resources.on("ready", () => {
      // Setup
      // this.fox = new Fox();
      this.koi = new Koi()
    });
  }

  update() {
    // if (this.fox) this.fox.update();
    if (this.koi) this.koi.update()
  }
}
