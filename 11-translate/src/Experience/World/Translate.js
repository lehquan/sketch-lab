import * as THREE from 'three'
import Experience from '../Experience';
export default class Translate {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.temp = 0.01;

    this.setObject()
  }
  setObject = () => {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      wireframe: true
    })

    //
    this.redBox = new THREE.Mesh(boxGeo, material)
    this.redBox.position.x = -5
    this.redBox.add( new THREE.AxesHelper(2))
    this.scene.add(this.redBox)

    this.yellowBox = new THREE.Mesh(boxGeo.clone(), material.clone())
    this.yellowBox.material.color = new THREE.Color(0xFFFF00)
    this.yellowBox.geometry.translate(5, 0, 0)
    this.yellowBox.add( new THREE.AxesHelper(2))
    this.scene.add(this.yellowBox)
  }
  update = () => {
    const max = 4.
    if (this.redBox) {
      this.redBox.rotation.y += 0.01

      this.redBox.position.y += this.temp;
      if(this.redBox.position.y >  max) this.temp = -0.01;
      if(this.redBox.position.y < -max) this.temp =  0.01;
    }

    if (this.yellowBox) {
      this.yellowBox.rotation.y += 0.01

      this.yellowBox.position.y += this.temp;
      if(this.yellowBox.position.y >  max) this.temp = -0.01;
      if(this.yellowBox.position.y < -max) this.temp =  0.01;
    }
  }
}
