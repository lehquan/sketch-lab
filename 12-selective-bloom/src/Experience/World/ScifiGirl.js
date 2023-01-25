import * as THREE from 'three'
import Experience from '../Experience';
export default class ScifiGirl {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources
    this.scene = this.experience.scene
    this.renderer = this.experience.renderer.instance
    this.postEffect = this.experience.postEffect

    this.setModel()
  }
  setModel = () => {
    this.model = this.resources.items.scifi_girl.scene
    this.model.position.set(0, -3, 0)
    this.model.scale.setScalar(2.5)
    this.model.rotation.y = Math.PI/180 * -90

    this.scene.add(this.model)

    // Store original model
    this.model.traverse(child => {
      child.frustumCulled = false
      if(child.material) {
        child.userData = {
          color: new THREE.Color().copy(child.material.color)
        }
      }
    })

    // If you wanna add particle into model position
    // this.particle = new Crystal()
    // this.particle.sparkle.position.copy(this.model.position)
    // this.particle.sparkle.position.x = this.model.position.x
    // this.particle.sparkle.position.z = this.model.position.z
    // this.particle.sparkle.position.y = this.model.position.y + 3.5
    // this.particle.start(0)
    // this.scene.add(this.particle.sparkle)
  }
  update = () => {
    // 1. Make all non-bloomed objects totally black
    if (this.model) {
      this.model.traverse(child => {
        if (child.material) child.material.color.set(0x000000)
      })
    }

    // 2. Render the scene with bloomComposer
    this.postEffect.bloomUpdate()

    // 3. Restore materials/colors to previous
    if (this.model) {
      this.model.traverse(child => {
        if (child.material) child.material.color.copy(child.userData.color)
      })
    }

    // 4. Render the scene with finalComposer
    this.postEffect.finalUpdate()

    // particles
    // if(this.particle) this.particle.update()
  }
}
