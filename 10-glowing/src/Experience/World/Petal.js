import * as THREE from 'three'
import Experience from '../Experience';

export default class Petal {
  constructor(material) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources

    this.count = 1000
    this.maxRange = 50;
    this.minRange = this.maxRange / 2;
    this.vertex = new THREE.Vector3();
    this.dummy = new THREE.Object3D()
    this.color = new THREE.Color();
    this.matrix = new THREE.Matrix4();
    this.position = new THREE.Vector3();
    this.colors = [0xffbccd, 0xffb2c8, 0xffaac1, 0xd07c96, 0xffaab7, 0xb4566e, 0xefaaaf, 0xff7fac, 0xffd6d6, 0xffa5a5, 0xffafc3, 0xffe7fc, 0xff9eb6, 0xffa3ba];

    this.setInstanedMesh()
  }
  getColor = () => {return this.colors[Math.floor(Math.random() * this.colors.length)]};
  setInstanedMesh = () => {
    const model = this.resources.items.cherry_petal.scene
    this._initMesh = model.getObjectByName('petal02')

    // this._initMesh.material.emissive = new THREE.Color(0xffaab7)
    // this._initMesh.material.emissiveIntensity = 0.2

    //
    const matrix = new THREE.Matrix4();
    this.instancedMesh = new THREE.InstancedMesh( this._initMesh.geometry, this._initMesh.material, this.count );

    for ( let i = 0; i < this.count; i ++ ) {
      this.randomizeMatrix( matrix );
      this.instancedMesh.setMatrixAt( i, matrix );

      // color
      this.instancedMesh.setColorAt(i, this.color.set(new THREE.Color(this.getColor())));
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.instancedMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame

    this.scene.add( this.instancedMesh );
  }
  randomizeMatrix = function () {

    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    return function ( matrix ) {

      position.x = Math.floor(Math.random() * this.maxRange - this.minRange) //Math.random() * 40 - 20;
      position.y = Math.floor(Math.random() * this.maxRange - this.minRange) // Math.random() * 40 - 20;
      position.z = Math.floor(Math.random() * this.maxRange - this.minRange) //Math.random() * 40 - 20;

      rotation.x = Math.random() * 2 * Math.PI;
      rotation.y = Math.random() * 2 * Math.PI;
      rotation.z = Math.random() * 2 * Math.PI;

      quaternion.setFromEuler( rotation );

      scale.x = scale.y = scale.z = Math.random() * 0.5;

      matrix.compose( position, quaternion, scale );

    };
  }();
  update = () => {
    if (this.instancedMesh) {
      for(let i=0; i< this.count; i++) {
        this.instancedMesh.getMatrixAt( i, this.matrix );

        // position: ok
        /*this.position.setFromMatrixPosition( this.matrix );
        this.position.y -= 0.02; // move
        this.matrix.setPosition( this.position );*/

        this.matrix.decompose(this.dummy.position, this.dummy.quaternion, this.dummy.scale);

        // position
        this.dummy.position.x -= 0.03
        this.dummy.position.y -= 0.02;
        if (this.dummy.position.x < - this.minRange) {
          this.dummy.position.x = this.minRange;
        }
        if (this.dummy.position.y < - this.minRange) {
          this.dummy.position.y = this.minRange;
        }

        // rotation
        this.dummy.rotation.x += 0.02 // * (i % 2 === 0 ? -1 : 1);
        this.dummy.rotation.y += 0.02 // * (i % 2 === 0 ? -1 : 1);
        this.dummy.rotation.z += 0.02 // * (i % 2 === 0 ? -1 : 1);
        this.dummy.updateMatrix();

        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        this.instancedMesh.instanceMatrix.needsUpdate = true;
      }
    }

  }
}
