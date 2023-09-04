import Experience from './Experience'
import Debug from '../utils/Debug';

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on("ready", () => {
      this.setEnv()
    });

    // if (this.debug.active) {
      // this.debugFolder = this.debug.ui.addFolder('Fog')
    // }

  }
  setEnv = () => {
    // this.scene.background = new THREE.Color(0xa5c9a5)
    this.scene.background = this.resources.items.sceneBackground

    /*const intensity = 1;
    const light = new THREE.DirectionalLight(0xFFFFFF, intensity);
    light.position.set(-1, 2, 4);
    this.scene.add(light);

    const near = 1;
    const far = 2
    const color = 'lightblue';
    this.scene.fog = new THREE.Fog(color, near, far);
    this.scene.background = new THREE.Color(color);

    if (this.debug.active) {
      const fogGUIHelper = new FogGUIHelper(this.scene.fog, this.scene.background)
      this.debugFolder.add(fogGUIHelper, 'near', near, 10000).onChange(val => {
        this.scene.fog.near = val
      })
      this.debugFolder.add(fogGUIHelper, 'far', far, 10000).onChange(val => {
        this.scene.fog.far = val
      })
      this.debugFolder.addColor(fogGUIHelper, 'color').onChange(val => {
        this.scene.fog.color.set(val);
        this.scene.background.set(val);
      })
    }*/
  }
  update = () => {
    this.experience.update()
  }
}
