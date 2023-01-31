import * as THREE from 'three'
import Experience from '../Experience';
export default class HallWay {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.clock = new THREE.Clock()
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
