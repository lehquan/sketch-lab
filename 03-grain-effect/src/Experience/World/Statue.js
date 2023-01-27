import Experience from '../Experience';

export default class Statue {
  constructor(_group, _grainMaterial) {
    this.experience = new Experience()
    this.resources = this.experience.resources
    this.grainMaterial = _grainMaterial
    this.group = _group

    this.setModel()
  }

  setModel = () => {
    this.model = this.resources.items.statueOfLiberty.scene
    this.model.scale.setScalar(1/4)
    this.model.position.y = -11
    this.group.add(this.model)

    this.model.traverse(child => {
      child.material = this.grainMaterial;
    });
  }
  update = () => {}
}
