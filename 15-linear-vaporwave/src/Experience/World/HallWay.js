import * as THREE from 'three'
import Experience from '../Experience';

export default class HallWay {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.clock = new THREE.Clock()
    this.params = {
      displacementScale: 0.4,
      metalness: 1,
      roughness: 0.5,
    }
    this.speed = 0
    this.position = 0

    // this.setGround()
    this.setModel()

    // window.addEventListener('wheel', this.debounce(this.onScrollHandler, 200));
    // window.addEventListener('wheel', this.onScrollHandler);
  }
  setGround = () => {
    console.log(this.resources.items)
    const geometry = new THREE.PlaneGeometry(1, 2, 1, 1)
    const material = new THREE.MeshStandardMaterial({
      roughnessMap: this.resources.items.floor_roughness,
      metalness: 0,
      roughness: 1,
      side: THREE.DoubleSide
    })

    this.plane = new THREE.Mesh(geometry, material)
    this.plane.rotation.x = -Math.PI * 0.5
    this.plane.position.set(0, -4.5, 0)
    this.plane.scale.setScalar(1000, 1000)
    this.scene.add(this.plane)
  }
  setModel = () => {
    this.hallway = this.resources.items.hallway.scene
    this.hallway.position.set(0, -2, -10)

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
    this.scene.add(this.hallway)

    //
    this.hallway2 = this.hallway.clone()
    this.hallway2.position.set(0, -2, -30)
    // this.scene.add(this.hallway2)

  }
  setPlane = () => {
    const geometry = new THREE.PlaneGeometry(1, 2, 24, 24)
    const material = new THREE.MeshStandardMaterial({
      map: this.resources.items.grid,
      displacementMap: this.resources.items.displacement,
      displacementScale: this.params.displacementScale,
      metalnessMap: this.resources.items.metalness,
      metalness: this.params.metalness,
      roughness: this.params.roughness
    })

    this.plane = new THREE.Mesh(geometry, material)
    this.plane.rotation.x = -Math.PI * 0.5
    this.plane.position.set(0, 0, 0.15)
    this.scene.add(this.plane)

    //
    this.plane2 = this.plane.clone()
    this.plane2.position.set(0, 0, -1.85)
    this.scene.add(this.plane2)
  }
  onScrollHandler = ev => {

    if (ev.deltaY < 0) {
      this.isScrolling = true

      // console.log('scrolling up')

      /*const prev = this.currentSelectedId
      if (this.currentSelectedId < this.projectData.length) {
        this.currentSelectedId++
        console.log('scrolling up: ', this.currentSelectedId, ' prev: ', prev)
      }

      this.gotoPage()*/
    }
    else if (ev.deltaY > 0) {
      this.isScrolling = true

      console.log('scrolling down')

      this.speed += ev.deltaY * 0.0002

     /* const prev = this.currentSelectedId
      if (this.currentSelectedId > 1) {
        this.currentSelectedId--
        console.log('scrolling down: ', this.currentSelectedId, ' prev: ', prev)
      }

      this.gotoPage()*/
    }
  }
  debounce = function(fn, d) {
    let timer;
    return function() {
      let context = this;
      let args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, d);
    }
  }
  update = () => {
    if (this.hallway) {
      /*this.plane.position.z = (this.clock.getElapsedTime() * 0.12) % 2
      this.plane2.position.z = ((this.clock.getElapsedTime() * 0.12) % 2) - 2;*/

      this.hallway.position.z += 0.15
      // this.hallway.position.z = (this.clock.getElapsedTime() * 0.15) % 2
      // this.hallway2.position.z = ((this.clock.getElapsedTime() * 0.15) % 2) - 2;

      /*this.position += this.speed
      this.speed *= 0.8
      this.plane.position.z = this.position

      if (this.plane.position.z >= 0.05) {
      }*/

    }
  }
}
