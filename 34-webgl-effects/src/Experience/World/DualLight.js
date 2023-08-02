import * as THREE from 'three'
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise';
import Experience from '../Experience'

export default class DualLight {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.clock = new THREE.Clock()

    this.perlin = new ImprovedNoise()
    this.count = 500
    this.params = {
      displacementScale: 0.4,
      metalness: 1,
      roughness: 0.5,
    }

    this.addObjects()
    this.addLights()
  }
  addObjects = () => {

    // buildings
    const geometry = new THREE.CylinderGeometry( 0, 1, 1, 4, 1 ).translate(0, .5, 0)
    const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true, side: THREE.DoubleSide } )

    for(let i=0; i< this.count; i++) {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(20*Math.random()-10, -2, 20*Math.random()-10)
      mesh.scale.set(0.5*Math.random(), 3*Math.random(), 0.5*Math.random())

      this.scene.add(mesh)
    }

    // ground
    let groundGeo = new THREE.PlaneGeometry(120, 120, 120, 120)
    groundGeo.rotateX(Math.PI * -0.5)
    let ground = new THREE.Mesh(groundGeo, material)
    ground.position.set(0, -2.5, 0)
    ground.scale.setScalar(5)
    this.scene.add(ground)

    this.pos = groundGeo.attributes.position
    this.uv = groundGeo.attributes.uv
    this.vUv = new THREE.Vector2()

    //  Opt 1: Random vertices by noise
    for(let i = 0; i < this.pos.count; i++){
      this.vUv.fromBufferAttribute(this.uv, i).multiplyScalar(100.0)
      let y = this.perlin.noise(this.vUv.x, this.vUv.y + 0.01, 0.01 * 0.1)
      this.pos.setY(i, y);
    }

    // Opt 2: Random vertices by Math.random()
    // for(let i=0; i<this.pos.count; i++) {
    //   let y = Math.random()
    //   this.pos.setY(i, y)
    // }
    this.pos.needsUpdate = true
    groundGeo.computeVertexNormals()
  }
  addLights = () => {
    // define green point light
    // then add antigreen spot light that will undo part of the green light
    // then add red spot light to fill in the gap in the green light
    // More: https://discourse.threejs.org/t/split-point-light-to-have-2-colours/49810/2

    const red = new THREE.Color(1, 0, 0)
    // const green = new THREE.Color(0, 1, 0)
    // const green = new THREE.Color(0.044, 0.074, 0.311)
    const green = new THREE.Color(0.063, 0.000, 0.622)
    const anti_green = new THREE.Color(-0.063, -0.000, -0.622)

    // attach all light to a sphere that is moved in the scene
    this.dualLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial()
    )
    this.scene.add(this.dualLight)

    const target = new THREE.Object3D()
    target.position.y = -1
    this.dualLight.add(target)

    const greenLight = new THREE.PointLight(green, 0.5)
    greenLight.distance = 15
    greenLight.position.set(0, 0, 0)
    this.dualLight.add(greenLight)

    const anti_greenLight = new THREE.SpotLight(anti_green, .5)
    anti_greenLight.position.set( 0, 0, 0 );
    anti_greenLight.distance = 15;
    anti_greenLight.target = target;
    anti_greenLight.angle = 0.5*Math.PI;
    anti_greenLight.penumbra = 1;
    this.dualLight.add(anti_greenLight)

    var redLight = new THREE.SpotLight( red, .5*4 )
    redLight.position.set( 0, 0, 0 );
    redLight.distance = 15;
    redLight.target = target;
    redLight.angle = 0.5*Math.PI;
    redLight.penumbra = 1;
    this.dualLight.add(redLight)

  }
  update = () => {
    const t = performance.now()
    // this.dualLight.position.set(
    //     6 * Math.sin( t/10000 ),
    //     0.5 + Math.cos( t/1000 ),
    //     6 * Math.sin( t/10000 ))

    // this.dualLight.position.x = 6*Math.sin( t/1300+1 );
    // this.dualLight.position.y = 2*Math.sin( t/900 );
    // this.dualLight.position.z = 6*Math.sin( t/1100-1 );
  }
}
