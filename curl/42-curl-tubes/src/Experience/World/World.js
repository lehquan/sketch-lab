import Experience from "../Experience.js";
import CurlNoise from "./CurlNoise";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;

    // Wait for resources
    this.resources.on("ready", () => {
      this.plane = new CurlNoise();
    });
  }
  update() {
    if (this.plane) this.plane.update();
  }
}
