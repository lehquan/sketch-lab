import Experience from '../Experience';

export default class Statue {
  constructor(_group, _grainMaterial) {
    this.experience = new Experience()
    this.resources = this.experience.resources
    this.grainMaterial = _grainMaterial
    this.group = _group

    this.setModel()
  }

  /**
   * Free download: https://sketchfab.com/3d-models/statue-of-liberty-84094e8d5e724b5c882cf576ca12e44e
   */
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
