import * as THREE from 'three'
import {ReflectorForSSRPass} from 'three/addons/objects/ReflectorForSSRPass';

import Experience from '../Experience';
export default class HallWay {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.sizes = this.experience.sizes

    this.otherMeshes = [];
    this.selects = [];

    this.setModel()
  }
  setGround = () => {
    this.ground = new THREE.Mesh(
        new THREE.PlaneGeometry( 8, 8 ),
        new THREE.MeshStandardMaterial( { metalness:1,roughness:.1, color: 0x606060 } )
    );
    this.ground.rotation.x = - Math.PI / 2;
    this.ground.position.y = 0.0365;
    // this.ground.receiveShadow = true;
    this.scene.add( this.ground );
  }
  setObjects = () => {
    const green = new THREE.Mesh(
        new THREE.BoxBufferGeometry( .05, .05, .05 ),
        new THREE.MeshStandardMaterial( { metalness:.5,roughness:.1, color: 'green' } ) );
    green.position.set( - .12, this.ground.position.y + .025, .015 );
    this.scene.add( green );
    this.otherMeshes.push( green );
    this.selects.push( green );

    const cyan = new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry( .025, 4 ),
        new THREE.MeshStandardMaterial( { metalness:.5,roughness:.1, color: 'cyan' } ) );
    cyan.position.set( - .05, this.ground.position.y + .025, .08 );
    this.scene.add( cyan );
    this.otherMeshes.push( cyan );
    this.selects.push( cyan );

    const yellow = new THREE.Mesh(
        new THREE.ConeBufferGeometry( .025, .05, 64 ),
        new THREE.MeshStandardMaterial( { metalness:.5,roughness:.1, color: 'yellow' } ) );
    yellow.position.set( - .05, this.ground.position.y + .025, - .055 );
    this.scene.add( yellow );
    this.otherMeshes.push( yellow );
    this.selects.push( yellow );

    this.groundReflector = new ReflectorForSSRPass( new THREE.PlaneBufferGeometry( 8, 8 ), {
      clipBias: 0.003,
      textureWidth: window.innerWidth,
      textureHeight: window.innerHeight,
      color: 0x888888,
      useDepthTexture: true,
    } );
    // window.this.groundReflector= this.groundReflector
    this.groundReflector.material.depthWrite = false;
    this.groundReflector.position.y = this.ground.position.y + .0001;
    this.groundReflector.rotation.x = - Math.PI / 2;
    this.groundReflector.visible = false;
    this.scene.add( this.groundReflector );
  }
  setModel = () => {
    this.hallway = this.resources.items.hallway.scene

    let rightColumn = this.hallway.getObjectByName('pillar_left').clone()
    rightColumn.position.x *= -1
    this.hallway.add(rightColumn)

    const leftScreen = this.hallway.getObjectByName('plane1')
    leftScreen.rotation.set(0, Math.PI/180 * 30, 0)
    leftScreen.material.map = this.resources.items.frame1
    leftScreen.material.side =THREE.BackSide

    const rightScreen = this.hallway.getObjectByName('plane2')
    rightScreen.rotation.set(0, Math.PI/180 * -30, 0)
    rightScreen.material = rightScreen.material.clone()
    rightScreen.material.map = this.resources.items.frame2
    rightScreen.material.side = THREE.BackSide

    const floor = this.hallway.getObjectByName('floor')
    floor.material.color = new THREE.Color(0x000000)

    const center = this.hallway.getObjectByName('center')
    center.material.color = new THREE.Color(0x000000)

    // 1
    this.hallway.position.set(0, -2, -10)
    this.scene.add(this.hallway)

    // 2
    this.hallway2 = this.hallway.clone()
    this.hallway2.position.set(0, -2, -30)
    this.scene.add(this.hallway2)

    // 3
    this.hallway3 = this.hallway.clone()
    this.hallway3.position.set(0, -2, -50)
    this.scene.add(this.hallway3)

    // 4
    this.hallway4 = this.hallway.clone()
    this.hallway4.position.set(0, -2, -70)
    this.scene.add(this.hallway4)
  }
  update = () => {
    if (this.hallway) {
      this.hallway.position.z += 0.05
      this.hallway2.position.z += 0.05
      this.hallway3.position.z += 0.05
      this.hallway4.position.z += 0.05

      if (this.hallway.position.z >= 10) {
        this.hallway.position.z = -68
      }

      if (this.hallway2.position.z >= 10) {
        this.hallway2.position.z = -68
      }

      if (this.hallway3.position.z >= 10) {
        this.hallway3.position.z = -68
      }

      if (this.hallway4.position.z >= 10) {
        this.hallway4.position.z = -68
      }
    }
  }
}
