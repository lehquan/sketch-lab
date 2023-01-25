import * as THREE from "three";
import Experience from "../Experience.js";

export default class Fox {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.mouse = this.experience.mouse.mouse
    this.targetMouse = this.experience.mouse.targetMouse
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;
    this.time = this.experience.time

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Fox");
    }

    // Resource
    this.resource = this.resources.items.foxModel;

    this.setModel();
    this.setMaterial();
    this.setAnimation();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.scale.setScalar(0.06)
    this.model.position.y = -1.5
    this.model.translateY(-2)
    this.scene.add(this.model);
  }

  setMaterial() {
    this.material = new THREE.MeshMatcapMaterial({
      matcap: this.resources.items.testMatcap,
    });

    this.model.traverse((child) => {
      child.material = this.material;
    });
  }

  setAnimation() {
    this.animation = {};

    // Mixer
    this.animation.mixer = new THREE.AnimationMixer(this.model);

    // Actions
    this.animation.actions = {};

    this.animation.actions.run = this.animation.mixer.clipAction(this.resource.animations[0]);
    this.animation.actions.survey = this.animation.mixer.clipAction(this.resource.animations[1]);
    this.animation.actions.walk = this.animation.mixer.clipAction(this.resource.animations[2]);

    this.animation.actions.current = this.animation.actions.run;
    this.animation.actions.current.play();

    // Play the action
    this.animation.play = (name) => {
      const newAction = this.animation.actions[name];
      const oldAction = this.animation.actions.current;

      newAction.reset();
      newAction.play();
      newAction.crossFadeFrom(oldAction, 1);

      this.animation.actions.current = newAction;
    };

    // Debug
    if (this.debug.active) {
      const debugObject = {
        playRun: () => {
          this.animation.play('run');
        },
        playSurvey: () => {
          this.animation.play('survey');
        },
        playWalking: () => {
          this.animation.play('walk');
        },
      };
      this.debugFolder.add(debugObject, "playRun");
      this.debugFolder.add(debugObject, "playSurvey");
      this.debugFolder.add(debugObject, "playWalking");
    }
  }

  update() {
    this.animation.mixer.update(this.time.delta * 0.001);

    this.mouse.x = THREE.MathUtils.lerp(this.mouse.x, this.targetMouse.x, 0.1)
    this.mouse.y = THREE.MathUtils.lerp(this.mouse.y, this.targetMouse.y, 0.1)
    this.model.rotation.y = THREE.MathUtils.degToRad(20 * this.mouse.x)
  }
}
