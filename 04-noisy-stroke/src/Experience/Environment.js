import * as THREE from 'three'
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.params = {
      helper: true,
      ambientColor: 0xff7f80, //0xB6CAED,
      directionalColor: 0x111111,
      fogColor: 0xeeeeee, //0x007f7f,
      fogNear: 6,
      fogFar: 20.
    };

    this.setEnvironment()
    this.addLights()
  }
  addLights = () => {
    const ambientLight = new THREE.AmbientLight(this.params.ambientColor, 1.);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(this.params.directionalColor,  1.5);
    dirLight.position.set(4, 4, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.camera.near = 2;
    dirLight.shadow.camera.far = 15;
    this.scene.add(dirLight);
  }
  setEnvironment = () => {
    this.scene.fog = new THREE.Fog(this.params.fogColor, this.params.fogNear, this.params.fogFar);
    // this.scene.background = this.params.fogColor

    // debug
    if (this.debug.active) {
      // helper
      /*this.debugFolder = this.debug.ui.addFolder('Scene')
      this.debugFolder.add(this.params, 'helper').onChange(val => {
        val ? this.scene.add(this.gridHelper) : this.scene.remove(this.gridHelper)
      })*/
      this.gridHelper = new THREE.GridHelper(20, 20, 0x8e8e8e, 0x8e8e8e)
      this.scene.add(this.gridHelper)

      // fog
      this.debugFolder = this.debug.ui.addFolder('Fog')
      this.debugFolder.add(this.params, "fogNear", 1, 12)
      .onChange(val => this.scene.fog.near = val)
      this.debugFolder.add(this.params, "fogFar", 12, 30)
      .onChange(val => this.scene.fog.far = val);
    }
  }
}
