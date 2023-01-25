import * as THREE from 'three'
import Experience from './Experience'
export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setEnv()
  }
  setEnv = () => {
    this.scene.background = new THREE.Color(0x000000)

    // lights
    this.scene.add( new THREE.AmbientLight( 0xffffff));

    const bottom_1 = new THREE.PointLight( 0xffffff, .5, 300 )
    bottom_1.position.set(0, -20, 250)
    this.scene.add( bottom_1 );

    const back = new THREE.PointLight( 0xffffff, 10, 300 )
    back.position.set(-100, -20, -250)
    this.scene.add( back );

    const bottom_2 = new THREE.PointLight( 0xFFBF00, 1, 2 )
    bottom_2.power = 100
    bottom_2.position.set(0, -3.5, 0)
    this.scene.add( bottom_2 );
  }
}
