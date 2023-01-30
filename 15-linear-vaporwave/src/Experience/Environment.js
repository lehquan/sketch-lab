import * as THREE from 'three'
import Experience from './Experience'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.params = {
      spotLightColor: 0xd53c3d
    }

    this.setEnv()
  }
  setEnv = () => {
    // fog
    const fog = new THREE.Fog(0x000000, 1, 2.5)
    // this.scene.fog = fog

    // lights
    this.scene.add( new THREE.AmbientLight(0xffffff, 1))

    const dir = new THREE.DirectionalLight(0xffffff, 3)
    dir.position.set(5, 7, 10)
    this.scene.add(dir)

    // right
    const rightSpot = new THREE.SpotLight(this.params.spotLightColor, 40, 25, Math.PI * 0.1, 0.25);
    rightSpot.position.set(0.5, 0.75, 2.1);
    rightSpot.target.position.set(-0.25, 0.25, 0.25);
    // this.scene.add(rightSpot, rightSpot.target);

    // left
    const leftSpot = rightSpot.clone()
    leftSpot.position.set(-0.5, 0.75, 2.2);
    leftSpot.target.position.set(0.25, 0.25, 0.25);
    // this.scene.add(leftSpot, leftSpot.target);
  }
  update = () => {
    this.experience.update()
  }
}
