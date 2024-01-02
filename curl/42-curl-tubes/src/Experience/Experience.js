import { Mesh, Object3D, REVISION, Scene, Texture } from "three";
import Sizes from "../utils/Sizes.js";
import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import World from "./World/World.js";
import Resources from "../utils/Resources.js";
import Stats from "../utils/Stats.js";
import sources from "./sources.js";
import Environment from "./Environment";
import Debug from "../utils/Debug";
import PostEffect from "./PostEffect";

let instance = null;

export default class Experience {
  constructor() {
    /**Singleton */
    if (instance) {
      return instance;
    }
    instance = this;

    /**Global Access */
    window.experience = this;
    this.isPostRender = false; // not using post-processing by default

    /**Canvas*/
    this.canvas = document.querySelector("#experience");
    console.log(`THREE REVISION: ${REVISION}`);

    /**Setup Classes */
    this.debug = new Debug();
    this.stats = new Stats();
    this.sizes = new Sizes();

    this.scene = new Scene();
    this.sceneBg = new Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.resources = new Resources(sources); // resources need renderer for meshopt
    new Environment();
    this.world = new World();
    this.postEffect = new PostEffect();

    this.sizes.on("resize", () => this.resize());
    this.tick();
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
    this.postEffect.resize();
  }

  update() {
    /**Begin analyzing frame */
    this.stats.active && this.stats.beforeRender();

    /**update everything */
    this.camera.update();
    this.world.update();
    // Don't update this.renderer if using PostProcessing
    this.isPostRender ? this.postEffect.update() : this.renderer.update();

    /**Finish analyzing frame */
    this.stats.active && this.stats.afterRender();
  }

  tick = () => {
    requestAnimationFrame(this.tick);
    this.update();
  };

  /**
   * Traverse the whole {resource} and clean up
   * geometry, material, texture, uniforms and skeleton.
   * @param resource
   */
  dispose = (resource) => {
    if (resource instanceof Object3D) {
      resource.traverse((child) => {
        // If object is type of SkinnedMesh
        if (child.isSkinnedMesh) {
          child.skeleton.dispose();
        }

        // geometry
        if (child.geometry) child.geometry.dispose();

        // material
        if (child.material) {
          // We have to check if there are any textures on the material
          for (const value of Object.values(child.material)) {
            if (value instanceof Texture) {
              value.dispose();
            }
          }

          // We also have to check if any uniforms reference textures or arrays of textures
          if (child.material.uniforms) {
            for (const value of Object.values(child.material.uniforms)) {
              if (value) {
                const uniformValue = value.value;
                // if (uniformValue instanceof Texture || Array.isArray(uniformValue)) {
                if (uniformValue instanceof Texture) {
                  uniformValue.dispose();
                }
              }
            }
          }

          // Dispose texture
          child.material.dispose();
        }
      });
    }

    // remove resource
    this.scene.remove(resource);
    this.sceneBg.remove(resource);
    console.info(this.renderer.instance.info);
  };
}
