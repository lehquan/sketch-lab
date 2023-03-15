import * as THREE from 'three'
import { InstancedUniformsMesh } from 'three-instanced-uniforms-mesh'
import positionData from '../../assets/particlePosition.json'
import Experience from '../Experience';
export default class GlowingTree {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.shades = [
        0x339900, 0x236b00, 0x5bad32, 0x3bb300, 0x44cc00,
        0xff205c, 0xe51c52, 0xff4c7c, 0xcc1949, 0xec003f,
        0xFF0000, 0xbd1a2e, 0xeb2d43, 0xc31227, 0x610913,
        0xff5c00, 0xe65300, 0xff7d33, 0xff6c1a, 0xb34000,
        0x1035AC, 0x0c277d, 0x123cc3, 0x1e4fea, 0x091f66,
        0x72C3BE, 0x67b0ab, 0x5b9c98, 0x508985, 0x447572, 0x39625f, 0x80c9c5
    ]

    this.setModel()
    this.makeInstance()
  }
  setModel = () => {
    const model = this.resources.items.cottage.scene
    model.scale.setScalar(6)
    model.position.set(0, -160, 50)
    this.scene.add(model)
  }
  makeInstance = () => {
    fetch(positionData).then(r => r.json()).then(pos => {
      this.setSpheres(pos)
    })
  }
  setSpheres = pos => {
    const color = new THREE.Color();
    const dummy = new THREE.Object3D()

    const geometry = new THREE.IcosahedronGeometry( 0.5, 3 );
    const material = new THREE.MeshBasicMaterial( {
      transparent: true,
    } );

    this.mesh = new InstancedUniformsMesh( geometry, material, pos.length);
    this.mesh.position.set(0, -50, 50)

    // random transformation and color
    for(let i=0; i<pos.length; i++){
      dummy.position.set(pos[i].tx * 5, pos[i].ty * 7, pos[i].tz * 3)
      dummy.scale.setScalar(THREE.MathUtils.randFloat(0.5, 2))
      dummy.updateMatrix()
      this.mesh.setMatrixAt(i, dummy.matrix)

      let shade = this.shades[Math.floor(Math.random() * this.shades.length)]
      this.mesh.setUniformAt('diffuse', i, color.setHex(shade))
    }

    //
    this.scene.add( this.mesh )
  }
  randomizeMatrix = function () {

    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    return function ( matrix ) {

      position.x = Math.random() * 40 - 20;
      position.y = Math.random() * 40 - 20;
      position.z = Math.random() * 40 - 20;

      rotation.x = Math.random() * 2 * Math.PI;
      rotation.y = Math.random() * 2 * Math.PI;
      rotation.z = Math.random() * 2 * Math.PI;

      quaternion.setFromEuler( rotation );

      scale.x = scale.y = scale.z = Math.random() * 1;

      matrix.compose( position, quaternion, scale );

    };

  }();
  update = () => {
    if (this.mesh) {
      for (let i = 0; i < this.mesh.count; i++) {
        const alpha = 0.5 + 0.5 * Math.sin(performance.now() * 0.0018 + i * 0.1)
        this.mesh.setUniformAt('opacity', i, alpha)
      }
    }
  }
}
