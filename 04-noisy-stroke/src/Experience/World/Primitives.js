import * as THREE from 'three'
import { gsap } from 'gsap'
import Experience from '../Experience'
import Torus from '../World/components/Torus'
import Cone from '../World/components/Cone';
import Box from '../World/components/Box';
import Cylinder from '../World/components/Cylinder';
import { map, radians } from '../../utils/utils';
import { randFloat} from 'three/src/math/MathUtils'

export default class Primitives {
  constructor(_material) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.controls = this.experience.camera.controls
    this.clock = new THREE.Clock()
    this.noiseMaterial = _material

    this.geometries = [new Box(), new Torus(), new Cone(), new Cylinder()]
    this.meshes = []
    this.params = {
      count: 5,
      targetGroupY: -10,
      isRunning: false
    }

    this.setObjects()
  }
  getMesh = (geometry, material) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = mesh.receiveShadow = true

    return mesh
  }
  setObjects = () => {
    this.groupMesh = new THREE.Object3D()
    this.groupMesh.name = 'Primitivies'
    this.groupMesh.position.y = this.params.targetGroupY

    for(let i=0; i<this.params.count; i++) {
      // const geo = this.geometries[Math.floor(Math.random() * 3 + 1)]
      const geo = this.geometries[Math.floor(Math.random()*this.geometries.length)];
      const mesh = this.getMesh(geo.geometry, this.noiseMaterial.clone())

      let xPos = THREE.MathUtils.randFloat(-2, 2);
      let yPos = THREE.MathUtils.randFloat(-2, 4);
      let zPos = THREE.MathUtils.randFloat(-3, 1);
      mesh.position.set(xPos, yPos, zPos)
      mesh.rotation.set(geo.rotationX, geo.rotationY, geo.rotationZ)
      mesh.scale.setScalar(0)

      mesh.userData = {
        initialRotation: {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        },
        isCompleted: false,
        speed: Math.random() + randFloat(1000, 1500),
      }
      this.groupMesh.add(mesh)
      this.meshes.push(mesh)
    }
  }
  makeClone = () => {
    return this.groupMesh.clone()
  }
  show = (_group) => {
    const tl = gsap.timeline()

    tl.to(_group.position, {
      duration: 2.5,
      y: 2.5,
      ease: "back.inOut(0.7)",
    })
    for(let i=0; i<_group.children.length; i++) {
      let mesh = _group.children[i]

      // gsap.to(mesh.position, {
      //   duration: 2.0,
      //   y: THREE.MathUtils.randFloat(-2, 2),
      //   ease: "back.inOut(4)",
      //   onComplete: () => {
      //     mesh.userData.isCompleted = true
      //   }
      // })
      const scaleFactor = THREE.MathUtils.randFloat(.3, 1.3)
      gsap.to(mesh.scale, {
        duration: 2.0,
        x: scaleFactor,
        y: scaleFactor,
        z: scaleFactor,
        ease: "Expo.easeOut",
        onComplete: () => mesh.userData.isCompleted = true
      })
      gsap.to(mesh.rotation, {
          duration: 3.5,
          x: map(mesh.position.y, -1, 1, radians(45), mesh.userData.initialRotation.x),
          y: map(mesh.position.y, -1, 1, radians(-90), mesh.userData.initialRotation.y),
          z: map(mesh.position.y, -1, 1, radians(90), mesh.userData.initialRotation.z),
          ease: "back.inOut(0.7)",
      })

      this.params.isRunning = true
    }
  }
  hide = (_groups) => {
    const tl = gsap.timeline()

    for(let i=0; i<_groups.length; i++) {
      const group = _groups[i]

      tl.to(group.position, {
        duration: 1.2,
        y: this.params.targetGroupY,
        ease: "back.inOut(0.7)",
      })
      for(let i=0; i<group.children.length; i++) {
        let mesh = group.children[i]

        // gsap.to(mesh.position, {
        //   duration: 1.0,
        //   y: THREE.MathUtils.randFloat(-2, 2),
        //   ease: "back.inOut(4)",
        //   onComplete: () => mesh.userData.isCompleted = false
        // })
        gsap.to(mesh.scale, {
          duration: 2.0,
          x: 0,
          y: 0,
          z: 0,
          ease: "Expo.easeOut",
          onComplete: () => mesh.userData.isCompleted = false
        })
        gsap.to(mesh.rotation, {
            duration: 3.5,
            x: mesh.userData.initialRotation.x,
            y: mesh.userData.initialRotation.y,
            z: mesh.userData.initialRotation.z,
            ease: "back.inOut(0.7)",
        })
      }
    }
  }
  update = (_currentTargetGroup) => {
    for(let i=0; i<_currentTargetGroup.children.length; i++) {
      const mesh = _currentTargetGroup.children[i]

      if (this.params.isRunning) {
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, (0.5 + Math.sin(performance.now() / mesh.userData.speed)) * 0.8, 0.5)
      }

      mesh.material.uniforms.uTime.value = performance.now() / 1200
      let val = mesh.material.uniforms.uProgress.value

      if (mesh.userData.isCompleted) {
        mesh.material.uniforms.uProgress.value =
            THREE.MathUtils.lerp(val, (0.5 + Math.sin(performance.now() / mesh.userData.speed)) * 0.5, 0.5)
      }
    }
  }
}
