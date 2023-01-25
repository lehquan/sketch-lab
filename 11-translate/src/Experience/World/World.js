import Experience from "../Experience.js"
import Translate from './Translate';
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug

    this.translate = new Translate()
  }
  update() {
    if (this.translate) this.translate.update()
  }
}
