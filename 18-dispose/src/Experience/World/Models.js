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

    this.animation = {}

    this.setModels()
    this.setAnimation()
  }

  setModels() {
    // fox
    this.foxResource = this.resources.items.foxModel
    this.fox = this.foxResource.scene
    this.fox.isModel = true
    this.fox.rotation.set(0, Math.PI/180 * -60, 0)
    this.fox.position.set(0, -30, 0)
    this.scene.add(this.fox)
    this.material = new THREE.MeshMatcapMaterial({
      matcap: this.resources.items.testMatcap,
    });
    this.fox.traverse((child) => {
      child.material = this.material;
    });

    // tontu
    this.tontuResource = this.resources.items.tontu
    this.tontu = this.tontuResource.scene
    this.tontu.isModel = true
    this.tontu.scale.setScalar(700)
    this.tontu.position.set(0, -30, 0)
    this.scene.add(this.tontu)

    // cherry
    this.cherry = this.resources.items.cherry.scene
    this.cherry.isModel = true
    this.scene.add(this.cherry)

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

  /**
   * Traverse the whole {resource} and clean up
   * geometry, material, texture, uniforms and skeleton.
   * @param resource
   */
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

  setAnimation() {

    // Mixers
    this.animation.foxMixer = new THREE.AnimationMixer(this.fox)
    this.animation.tontuMixer = new THREE.AnimationMixer(this.tontu)

    // fox
    this.animation.foxActions = {}
    this.animation.foxActions.run = this.animation.foxMixer.clipAction(this.foxResource.animations[0])
    this.animation.foxActions.survey = this.animation.foxMixer.clipAction(this.foxResource.animations[1]);
    this.animation.foxActions.walk = this.animation.foxMixer.clipAction(this.foxResource.animations[2]);
    this.animation.foxActions.run.play()

    // tontu
    this.animation.tontuActions = {}
    this.animation.tontuActions.dance = this.animation.tontuMixer.clipAction(this.tontuResource.animations[0])
    this.animation.tontuActions.intro = this.animation.tontuMixer.clipAction(this.tontuResource.animations[1])
    this.animation.tontuActions.dance.play()
  }

  update() {
    const delta = this.clock.getDelta()

    this.animation.foxMixer.update(delta)
    this.animation.tontuMixer.update(delta)
  }
}
