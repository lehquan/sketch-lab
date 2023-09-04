import Experience from "../Experience.js"
import NoisyStroke from './NoisyStroke';
import CameraTarget from './CameraTarget';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.resources = this.experience.resources

    const points = this.camera.points

    // Wait for resources
    this.resources.on("ready", () => {
      this.noisyStroke = new NoisyStroke()
      const noiseMaterial = this.noisyStroke.material

      this.target = new CameraTarget(points, noiseMaterial)
    })
  }
  update() {
    if (this.target) this.target.update()
  }
}
