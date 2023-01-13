import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'
import { Text } from 'troika-three-text'
import { gsap } from 'gsap'
import Experience from '../Experience'

export default class TextNote {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.clock = new THREE.Clock()
    this.perlin = new ImprovedNoise()

    this.textParams = {
      size: 30,
      height: 1,
      curveSegments: 4,
      bevelThickness: 1,
      bevelSize: 0.5,
    }
    this.colors = [0xf5e4b1, 0xd3b486, 0xb18461, 0x6e3029, 0x4c1619, 0x2a0810];

    this.createText()
  }
  createText = () => {
    /*const font = new Font(this.resources.items.fontKenpixel)
    const geometry = new TextGeometry('three.js', {
      font: font,
      bevelEnabled: true,
      size: this.textParams.size,
      height: this.textParams.height,
      bevelThickness: this.textParams.bevelThickness,
      bevelSize: this.textParams.bevelSize
    })
    geometry.center()
    geometry.computeBoundingBox()
    geometry.computeVertexNormals()
    // const centerOffset = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

    const material = new THREE.MeshStandardMaterial( {
      color: 0x48271b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0
    });
    const text = new THREE.Mesh( geometry, material );
    text.scale.setScalar(1/8)
    text.position.set(0, -1, 0)
    text.rotation.set(Math.PI/180 * -120, 0, 0)

    // text.add( new THREE.AxesHelper(100))
    this.scene.add(text)

    const myText = new Text()
    myScene.add(myText)*/

    let note = new Text()
    note.text = 'Pick me!'
    note.fontSize = this.textParams.size
    note.font = 'assets/fonts/Sacramento-Regular.ttf'
    note.color = this.getRandomColor()
    note.rotation.set(Math.PI/180 * -120, 0, Math.PI/180 * 15)
    note.position.set(-10, 0.8, 0)
    note.scale.setScalar(1/6)
    // note.add(new THREE.AxesHelper(100))

    this.position = note.geometry.attributes.position
    this.uv = note.geometry.attributes.uv
    this.vUv = new THREE.Vector2()

    note.sync()
    this.scene.add(note)
  }
  getRandomColor = () => {
    return this.colors[Math.floor(Math.random() * this.colors.length)]
  }
  update = () => {
    const t = this.clock.getElapsedTime()
    for(let i=0; i<this.position.count; i++) {
      this.vUv.fromBufferAttribute(this.uv, i).multiplyScalar(2.5)
      const z = this.perlin.noise(this.vUv.x, this.vUv.y + t,  t * 1.5)
      this.position.setZ(i, z)
    }
    this.position.needsUpdate = true
  }
}
