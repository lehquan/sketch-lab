import Experience from '../Experience';
import Pillars from './Pillars';
import Balloon from './Balloon';

export default class Primitives {
  constructor(_group, _grainMaterial) {
    this.experience = new Experience()
    this.resources = this.experience.resources
    this.mouse = this.experience.mouse.mouse
    this.targetMouse = this.experience.mouse.targetMouse
    this.grainMaterial = _grainMaterial
    this.group = _group

    this.pillars = new Pillars(_group, _grainMaterial)
    this.balls = new Balloon(_group, _grainMaterial)
  }
  update = () => {
    this.balls.update()
    this.pillars.update()
  }
}
