import * as THREE from 'three'
import { gsap } from 'gsap'
import Experience from '../Experience';
import {randFloat} from 'three/src/math/MathUtils';

export default class ModelSet {
  constructor(_material) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.noiseMaterial = _material
    this.clock = new THREE.Clock()

    this.models = []
    this.params = {
      count: 2,
      targetGroupY: -10,
      isRunning: false
    }

    this.setModels()
  }
  setModels = () => {
    this.groupModel = new THREE.Object3D()
    this.groupModel.name = 'Models'
    this.groupModel.position.y = this.params.targetGroupY

    // fox
    const fox = this.resources.items.foxModel.scene
    fox.traverse(child => {
      if (child.material) child.material = this.noiseMaterial
      if(child.geometry) child.geometry.center()
    })

    for(let i=0; i<this.params.count; i++) {
      const model = fox.clone()
      model.name = 'model_'+i
      let xPos = THREE.MathUtils.randFloat(-2, 2);
      let yPos = THREE.MathUtils.randFloat(-2, 4);
      let zPos = THREE.MathUtils.randFloat(-3, 1);
      model.position.set(xPos, yPos, zPos)
      model.rotation.set(0, 0, 0)
      model.scale.setScalar(0)

      model.userData = {
        initialRotation: {
          x: model.rotation.x,
          y: model.rotation.y,
          z: model.rotation.z,
        },
        isCompleted: false,
        speed: Math.random() + randFloat(1000, 2000),
      }

      this.groupModel.add(model)
      this.models.push(model)
    }

    // face
    /*this.face = this.resources.items.oldFace.scene
    this.face.scale.setScalar(3)
    this.face.position.set(0, 0.5, 0)
    this.face.receiveShadow = this.face.castShadow = true

    this.face.traverse(child => {
      if (child.material) {
        child.material = this.noiseMaterial
      }
      if(child.geometry) {
        child.geometry.center()
      }
    })*/
  }
  makeClone = () => {
    return this.groupModel.clone()
  }
  show = (_group) => {
    console.log('show: ', _group)
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
      //   onComplete: () => mesh.userData.isCompleted = true
      // })
      const scaleFactor = THREE.MathUtils.randFloat(0.0125, 0.05)
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
        x: Math.PI/180 * THREE.MathUtils.randFloat(-10, 45),
        y: Math.PI/180 * THREE.MathUtils.randFloat(-10, -45),
        z: 0,
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
      const model = _currentTargetGroup.children[i]

      if (this.params.isRunning) {
        model.position.y = THREE.MathUtils.lerp(model.position.y, (0.5 + Math.sin(performance.now() / model.userData.speed)) * 0.8, 0.5)
      }

      model.traverse(child => {
        if (child.material) {
          child.material.uniforms.uTime.value = performance.now() / 1200

          let val = child.material.uniforms.uProgress.value

          if (model.userData.isCompleted) {
            child.material.uniforms.uProgress.value =
                THREE.MathUtils.lerp(val, (0.5 + Math.sin(performance.now() / model.userData.speed)) * 0.5, 0.5)
          }
        }
      })
    }
  }
}
