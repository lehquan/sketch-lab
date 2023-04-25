import * as THREE from 'three'
// import { gsap, Cubic, Bounce, Expo, TimelineMax } from 'gsap/all'
import { Bounce, Expo, TimelineMax } from 'gsap'
import Experience from '../Experience'

export default class Pool {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance

    this.params = {
      STEP: 100,
      count: 2000,
    }
    this.rot = 0;
    this.edgesPool = []

    this.setEnv()
    this.setTimeLine()
    this.setBoxes()
  }
  setEnv = () => {
    // fog
    this.scene.fog = new THREE.Fog(0x000000, 100, 12500)

    // grid
    const grid = new THREE.GridHelper(20000, this.params.STEP, 0x393646, 0x393646)
    this.scene.add(grid)

    // camera
    this.cameraPositionTarget = new THREE.Vector3()
    this.cameraLookAtTarget = new THREE.Vector3()
  }
  setTimeLine = () => {
    // this.timeline = gsap.timeline({ repeat: -1 })
    this.timeline = new TimelineMax({ repeat: -1 });

    this.timeline.set(this, { rot: 135 }, 0);
    this.timeline.to(this, 7, { rot: 0, ease: Cubic.easeInOut }, 0);
    this.timeline.set(this.cameraPositionTarget, { y: 0 }, 0);
    this.timeline.to(this.cameraPositionTarget, 6, { y: 400, ease:Cubic.easeInOut}, 0);
    this.timeline.set(this.cameraLookAtTarget, { y: 500 }, 0);
    this.timeline.to(this.cameraLookAtTarget, 6, { y: 0, ease: Cubic.easeInOut }, 0);
  }
  setBoxes = () => {
    // const geometry = new THREE.BoxGeometry(this.params.STEP, this.params.STEP, this.params.STEP, 1, 1, 1)
    const geometry = new THREE.IcosahedronGeometry( 15, 5 );

    for(let i=0; i<this.params.count; i++) {
      const edges = new THREE.EdgesGeometry( geometry );
      const mesh = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x393646 } ) );

      mesh.position.x = this.params.STEP *  Math.round(20000 * (Math.random() - 0.5) / this.params.STEP) + this.params.STEP / 2;
      mesh.position.z = this.params.STEP *  Math.round(20000 * (Math.random() - 0.5) / this.params.STEP) + this.params.STEP / 2;
      mesh.updateMatrix()
      this.scene.add(mesh)
      this.edgesPool.push(mesh)

      // set cube failing motion
      const sec = 2 * Math.random() + 3;
      this.timeline.set(mesh.position, { y: 8000 }, 0)
      this.timeline.to(mesh.position, sec, { y: this.params.STEP / 2 + 1, ease: Bounce.easeOut }, 0)
    }
    this.createTimescale()
    this.timeline.addCallback( () => {
      this.createTimescale(this.timeline);
    }, this.timeline.duration());
  }
  createTimescale = () => {
    const totalTimeline = new TimelineMax();
    totalTimeline
    .set(this.timeline, { timeScale: 1.5 })
    .to(this.timeline, 1.5, { timeScale: 0.01, ease: Expo.easeInOut }, "+=0.8")
    .to(this.timeline, 1.5, { timeScale: 1.5, ease: Expo.easeInOut }, "+=5");
  }
  update = () => {
    this.camera.position.x = 1000 * Math.cos(this.rot * Math.PI / 180);
    this.camera.position.z = 1000 * Math.sin(this.rot * Math.PI / 180);
    this.camera.position.y = this.cameraPositionTarget.y;
    this.camera.lookAt(this.cameraLookAtTarget);
    for (let i = 0; i < this.edgesPool.length; i++) {
      this.edgesPool[i].updateMatrix();
    }
  }
}
