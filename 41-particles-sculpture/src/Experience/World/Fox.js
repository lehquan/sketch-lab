import { AnimationMixer, Clock } from 'three';
import Experience from "../Experience.js"

export default class Fox {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    // this.mouse = this.experience.mouse.mouse
    // this.targetMouse = this.experience.mouse.targetMouse
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.clock = new Clock()

    this.setModel()
    this.setDebug()
  }

  /**
   * Set debug mode.
   */
  setDebug = () => {
    if (this.debug.active) {
      const debugFolder = this.debug.ui.addFolder("Fox")

      const debugObject = {
        playRun: () => {
          this.animation.play('run')
        },
        playSurvey: () => {
          this.animation.play('survey')
        },
        playWalking: () => {
          this.animation.play('walk')
        },
        stop: () => {
          this.animation.mixer.stopAllAction()
        },
      }
      debugFolder.add(debugObject, "playRun")
      debugFolder.add(debugObject, "playSurvey")
      debugFolder.add(debugObject, "playWalking")
      debugFolder.add(debugObject, "stop")
    }
  }

  setModel() {
    /*this.foxModel = this.resources.items.foxModel

    const model = this.foxModel.scene
    model.position.set(0, -0.5, 0)
    model.rotation.set(0, Math.PI/180 * -80, 0)
    model.scale.setScalar(0.02)
    this.scene.add(model)

    // material
    this.material = new MeshMatcapMaterial({
      matcap: this.resources.items.testMatcap,
    })

    model.traverse(child => {
      if (child.material) child.material = this.material
    })

    this.setAnimation()
    */

    const model = this.resources.items.helmet.scene
    this.scene.add(model)
  }

  setAnimation() {
    this.animation = {}

    // Mixer
    this.animation.mixer = new AnimationMixer(this.foxModel.scene)

    // Actions
    this.animation.actions = {}

    this.animation.actions.run = this.animation.mixer.clipAction(this.foxModel.animations[0])
    this.animation.actions.survey = this.animation.mixer.clipAction(this.foxModel.animations[1])
    this.animation.actions.walk = this.animation.mixer.clipAction(this.foxModel.animations[2])

    this.animation.actions.current = this.animation.actions.run
    this.animation.actions.current.play()

    // Play the action
    this.animation.play = (name) => {
      const newAction = this.animation.actions[name]
      const oldAction = this.animation.actions.current

      newAction.reset()
      newAction.play()
      newAction.crossFadeFrom(oldAction, 1)

      this.animation.actions.current = newAction
    }
  }

  update() {
    // this.animation.mixer.update(this.time.delta * 0.001)
    if(this.animation) this.animation.mixer.update(this.clock.getDelta())

    // this.mouse.x = MathUtils.lerp(this.mouse.x, this.targetMouse.x, 0.1)
    // this.mouse.y = MathUtils.lerp(this.mouse.y, this.targetMouse.y, 0.1)
    // this.model.rotation.y = MathUtils.degToRad(20 * this.mouse.x)
  }
}
