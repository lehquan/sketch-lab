import * as THREE from 'three'
import { FlakesTexture } from 'three/addons/textures/FlakesTexture'
import * as CANNON from 'cannon-es'
import { AmmoPhysics } from 'three/addons/physics/AmmoPhysics.js'
// import { gsap, Cubic, Bounce, Expo, TimelineMax } from 'gsap/all'
import { Bounce, Expo, TimelineMax } from 'gsap'
import Experience from '../Experience'

export default class Pool {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.clock = new THREE.Clock()

    this.params = {
      STEP: 100,
      count: 2000,
    }
    this.rot = 0;
    this.edgesPool = []

    // physic
    this.physic = new CANNON.World()
    this.physic.gravity.set(0, -9.82, 0)

    // camera
    this.cameraPositionTarget = new THREE.Vector3()
    this.cameraLookAtTarget = new THREE.Vector3()

    this.setTimeLine()
    this.setBoxes()

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
    // floor shadow
    const planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
    planeGeometry.rotateX( - Math.PI / 2 );
    const planeMaterial = new THREE.ShadowMaterial( { color: 0xffffff, opacity: 0.2 } );
    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.receiveShadow = true;
    this.scene.add( plane );

    // texture
    const texture = new THREE.CanvasTexture(new FlakesTexture())
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.x = 10/6
    texture.repeat.y = 6/6

    // const geometry = new THREE.BoxGeometry(this.params.STEP, this.params.STEP, this.params.STEP, 1, 1, 1)
    const geometry = new THREE.IcosahedronGeometry( 15, 5 );
    const material = new THREE.MeshStandardMaterial({
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      metalness: 0.5,
      roughness: 0.9,
      color: 0xE76161,
      normalMap: texture,
      normalScale: new THREE.Vector2(0.15, 0.15),
      envMap: texture,
    })

    for(let i=0; i<this.params.count; i++) {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true

      mesh.position.x = this.params.STEP *  Math.round(20000 * (Math.random() - 0.5) / this.params.STEP) + this.params.STEP / 2;
      mesh.position.z = this.params.STEP *  Math.round(20000 * (Math.random() - 0.5) / this.params.STEP) + this.params.STEP / 2;
      mesh.updateMatrix()
      this.scene.add(mesh)
      this.edgesPool.push(mesh)

      // physic
      const sphereShape = new CANNON.Sphere(1)
      const sphereBody = new CANNON.Body({ mass: 1 })
      sphereBody.addShape(sphereShape)
      sphereBody.position.x = mesh.position.x
      sphereBody.position.y = mesh.position.y
      sphereBody.position.z = mesh.position.z
      this.physic.addBody(sphereBody)

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
    this.camera.position.x = 1200 * Math.cos(this.rot * Math.PI / 180);
    this.camera.position.z = 1200 * Math.sin(this.rot * Math.PI / 180);
    this.camera.position.y = this.cameraPositionTarget.y;
    this.camera.lookAt(this.cameraLookAtTarget); // lock camera

    // physic
    // const delta = Math.min(this.clock.getDelta(), 0.1)
    // this.physic.step(delta)

    for (let i = 0; i < this.edgesPool.length; i++) {
      this.edgesPool[i].updateMatrix();
    }


  }
}
