import * as THREE from "three";
import Experience from "../Experience.js";

export default class Models {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.renderer = this.experience.renderer.instance
    this.debug = this.experience.debug;
    this.clock = new THREE.Clock()

    this.setModels()

    // for fox
    this.setMaterial()
    this.setAnimation()
  }

  setModels() {
    // fox
    this.resource = this.resources.items.foxModel
    this.fox = this.resource.scene
    this.fox.isModel = true
    this.fox.rotation.set(0, Math.PI/180 * -60, 0)
    this.fox.position.set(0, -30, 0)
    this.scene.add(this.fox)

    // cherry
    this.cherry = this.resources.items.cherry.scene
    this.cherry.isModel = true
    this.scene.add(this.cherry)

    // tontu
    this.tontu = this.resources.items.tontu.scene
    this.tontu.isModel = true
    this.tontu.scale.setScalar(700)
    this.tontu.position.set(0, -30, 0)
    this.scene.add(this.tontu)

    console.log(this.renderer.info)

    if (this.debug.active) {
      // ADD
      this.debugFolder = this.debug.ui.addFolder("scene.add()");
      const addDebug = {
        addFox: () => {
          this.fox.isModel = true
          this.scene.add(this.fox)
          console.log(this.renderer.info)
        },
        addCherry: () => {
          this.cherry.isModel = true
          this.scene.add(this.cherry)
          console.log(this.renderer.info)
        },
        addTontu: () => {
          this.tontu.isModel = true
          this.scene.add(this.tontu)
          console.log(this.renderer.info)
        },
      };
      this.debugFolder.add(addDebug, "addFox");
      this.debugFolder.add(addDebug, "addCherry");
      this.debugFolder.add(addDebug, "addTontu");

      // dispose
      this.debugFolder = this.debug.ui.addFolder(".dispose()");
      const disposeDebug = {
        disposeFox: () => {
          this.dispose(this.fox)
          console.log(this.renderer.info)
        },
        disposeCherry: () => {
          this.dispose(this.cherry)
          console.log(this.renderer.info)
        },
        disposeTontu: () => {
          this.dispose(this.tontu)
          console.log(this.renderer.info)
        },
        disposeAll: () => {

          this.dispose(this.fox)
          this.dispose(this.cherry)
          this.dispose(this.tontu)
          console.log(this.renderer.info)
        },
      };
      this.debugFolder.add(disposeDebug, "disposeFox");
      this.debugFolder.add(disposeDebug, "disposeCherry");
      this.debugFolder.add(disposeDebug, "disposeTontu");
      this.debugFolder.add(disposeDebug, "disposeAll");

      // remove
      this.debugFolder = this.debug.ui.addFolder("scene.remove()");
      const removeDebug = {
        removeFox: () => {
          this.scene.remove(this.fox)
          console.log(this.renderer.info)
        },
        removeCherry: () => {
          this.scene.remove(this.cherry)
          console.log(this.renderer.info)
        },
        removeTontu: () => {
          this.scene.remove(this.tontu)
          console.log(this.renderer.info)
        },
        removeAll: () => {

          this.scene.remove(this.fox, this.cherry, this.tontu)
          console.log(this.renderer.info)
        },
      };
      this.debugFolder.add(removeDebug, "removeFox");
      this.debugFolder.add(removeDebug, "removeCherry");
      this.debugFolder.add(removeDebug, "removeTontu");
      this.debugFolder.add(removeDebug, "removeAll");
    }
  }

  dispose = resource => {

    if (resource instanceof THREE.Object3D) {

      resource.traverse(child => {

        // If object is type of SkinnedMesh
        if (child.isSkinnedMesh) {
          child.skeleton.dispose()
        }

        // geometry
        if (child.geometry) child.geometry.dispose()

        // material
        if (child.material) {

          // We have to check if there are any textures on the material
          for (const value of Object.values(child.material)) {
            if (value instanceof THREE.Texture) {
              value.dispose()
            }
          }

          // We also have to check if any uniforms reference textures or arrays of textures
          if (child.material.uniforms) {
            for (const value of Object.values(child.material.uniforms)) {
              if (value) {
                const uniformValue = value.value;
                if (uniformValue instanceof THREE.Texture || Array.isArray(uniformValue)) {
                  uniformValue.dispose()
                }
              }
            }
          }

          // Dispose texture
          child.material.dispose()
        }
      })
    }

    // remove resource
    this.scene.remove(resource)
  }

  setMaterial() {
    this.material = new THREE.MeshMatcapMaterial({
      matcap: this.resources.items.testMatcap,
    });

    this.fox.traverse((child) => {
      child.material = this.material;
    });
  }

  setAnimation() {
    this.animation = {};

    // Mixer
    this.animation.mixer = new THREE.AnimationMixer(this.fox);

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
    /*if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Fox");

      const foxDebug = {
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
      this.debugFolder.add(foxDebug, "playRun");
      this.debugFolder.add(foxDebug, "playSurvey");
      this.debugFolder.add(foxDebug, "playWalking");
      this.debugFolder.close()
    }*/
  }

  update() {

    // this.animation.mixer.update(this.time.delta * 0.001);
    this.animation.mixer.update(this.clock.getDelta());

    // this.mouse.x = THREE.MathUtils.lerp(this.mouse.x, this.targetMouse.x, 0.1)
    // this.mouse.y = THREE.MathUtils.lerp(this.mouse.y, this.targetMouse.y, 0.1)
    // this.fox.rotation.y = THREE.MathUtils.degToRad(20 * this.mouse.x)
  }
}
