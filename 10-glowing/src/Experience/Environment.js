import * as THREE from 'three'
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.setLight()
    this.setEnv()
  }
  setEnv = () => {
    // this.scene.background = new THREE.Color(0xffaacc)
    // this.scene.background = new THREE.Color(0xd6adad)
    // this.scene.add( new THREE.AmbientLight( 0xd6adad, 0.1 ) );
    // this.scene.add( new THREE.AmbientLight( 0x000000, 0.5 ) );

    // const light = new THREE.SpotLight(0xffffff, 0.2, 10, Math.PI/3, 0.3)
    // // light.position.set(0, 2, 2)
    // light.position.set(0, 5, 2)
    // light.target.position.set(0, 0, 0)
    //
    // light.castShadow = true
    // light.shadow.camera.near = 0.1
    // light.shadow.camera.far = 9
    // light.shadow.bias = 0.0001
    // light.shadow.mapSize.width = 2048
    // light.shadow.mapSize.height = 2048
    // this.scene.add(light)
  }
  setLight = () => {
    this.scene.add( new THREE.AmbientLight( 0xb2768e, .2 ) );

    // const light = new THREE.SpotLight( 0x663200, .5 );
    const light = new THREE.SpotLight( 0xFF7F00, .5 );
    light.position.set(0, 10, 0)
    light.castShadow = true;
    light.target.position.set(0, 0, 0)
    light.angle = 0.5;
    light.penumbra = 0.3;
    light.decay = 2;
    light.shadow.bias = -.001
    light.distance = 50;
    this.scene.add(light)
  }
}
