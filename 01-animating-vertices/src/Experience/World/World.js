import Experience from "../Experience.js"
import Flag from './Flag';
import {EVT} from '../../utils/contains';

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on(EVT.READY, () => {
      this.flag = new Flag()
    })
  }
  update() {
    if (this.flag) this.flag.update()
  }
}
