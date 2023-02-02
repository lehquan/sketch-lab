import * as THREE from 'three'
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.renderer = this.experience.renderer.instance
    this.resources = this.experience.resources

    this.setLight()
    /*this.resources.on("ready", () => {
      this.setEnv()
    })*/
  }
  setEnv = () => {
    const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
    pmremGenerator.compileEquirectangularShader();

    const texture = this.resources.items.royal_esplanade
    texture.mapping = THREE.EquirectangularReflectionMapping
    // this.scene.environment = texture

    // const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
    this.scene.background = texture;
    this.scene.environment = texture;
    texture.dispose();
    pmremGenerator.dispose();
  }
  setLight = () => {
    this.scene.fog = new THREE.Fog( 0x000000, 1, 70 );

    this.scene.add( new THREE.AmbientLight(0xffffff, 10))

    const dir = new THREE.DirectionalLight(0xffffff, 3)
    dir.position.set(5, 7, 10)
    this.scene.add(dir)

    // const hemiLight = new THREE.HemisphereLight( 0x443333, 0x111122 );
    // this.scene.add( hemiLight );
    //
    // const spotLight = new THREE.SpotLight();
    // spotLight.angle = Math.PI / 16;
    // spotLight.penumbra = 0.5;
    // spotLight.position.set( - 1, 1, 1 );
    // this.scene.add( spotLight );
  }
  update = () => {}
}
