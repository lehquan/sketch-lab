import Experience from "../Experience.js"
import WallShapes from './WallShapes';
import TextNote from './TextNote';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      // https://tympanus.net/codrops/2019/12/10/building-a-physics-based-3d-menu-with-cannon-js-and-three-js/
      // https://tympanus.net/codrops/2019/10/10/create-text-in-three-js-with-three-bmfont-text/
      this.textNode = new TextNote()
    })

    // https://tympanus.net/codrops/2018/12/06/interactive-repulsion-effect-with-three-js/
    this.wall = new WallShapes()
  }
  update() {
    if (this.wall) this.wall.update()
    if (this.textNode) this.textNode.update()
  }
}
