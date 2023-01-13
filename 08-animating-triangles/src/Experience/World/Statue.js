import * as THREE from 'three'
import { gsap } from 'gsap'
import { randFloat} from 'three/src/math/MathUtils'
import Experience from '../Experience'
import { extendMaterial, CustomMaterial } from './ExtendMaterial';
import {EVT} from '../../utils/contains';

export default class Statue {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources
    this.sound = this.experience.sound
    this.debug = this.experience.debug

    this.button1 = document.querySelector('#model-1')
    this.button2 = document.querySelector('#model-2')

    this.currentObject = null
    this.params = {
      uTime: 0,
      progress: 0,
      isRunning: false,
      isShow: false,
      speed: Math.random() + randFloat(1200, 1500)
    }

    this.makeExtendMaterial()
    this.addFloor()
    this.addModels()

    window.addEventListener(EVT.OPEN_STATUE, this.onClickHandler)
  }
  onClickHandler = (e) => {
    this.sound.dispose()

    switch (e.detail) {
      case 1:
          this.button1.classList.add('active')
          this.button1.style.pointerEvents ='all'

          this.button2.classList.remove('active')
          this.button2.style.pointerEvents ='none'
          this.show(this.dancer)
        break;
      case 2:
          this.button1.classList.remove('active')
          this.button1.style.pointerEvents ='none'

          this.button2.classList.add('active')
          this.button2.style.pointerEvents ='all'
          this.show(this.liberty)
        break;
    }
  }
  addFloor = () => {
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshLambertMaterial({
          color: 0xe5e1d6,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 1
        })
    )
    floor.scale.setScalar(2000)
    floor.castShadow = false
    floor.receiveShadow = true

    const wallBack = floor.clone()
    const wallLeft = floor.clone()

    floor.rotation.x = -Math.PI*0.5
    floor.position.set(0, -0.95, 0)
    wallBack.position.set(0, 0, -100)

    wallLeft.scale.setScalar(2000)
    wallLeft.position.set(-100, 10, 0)
    wallLeft.rotation.y = Math.PI/180 * 90
    this.scene.add(floor, wallBack, wallLeft)
  }
  addModels = () => {
    this.dancer = this.resources.items.dancer.scene
    this.dancer.scale.setScalar(1)
    this.dancer.name = 'Dancer'
    this.scene.add(this.dancer)

    this.liberty = this.resources.items.liberty.scene
    this.liberty.position.set(0, -2.75, 0)
    this.liberty.rotation.set(0, Math.PI/180 * -90, 0)
    this.liberty.scale.setScalar(1/20)
    this.liberty.name = 'Liberty'
    this.scene.add(this.liberty)

    // dancer
    this.dancer.traverse(child => {
      child.castShadow = true

      if (child.material) {
        child.material = this.dancerExMaterial
        child.customDepthMaterial = extendMaterial( THREE.MeshDepthMaterial, {
          template: this.dancerExMaterial
        });
      }

      if (child.geometry) {
        this.setGeometry(child);
      }
    })
    this.dancerExMaterial.uniforms.progress.value = 0
    this.dancerExMaterial.uniforms.uScale.value = 300.0

    // liberty
    this.liberty.traverse(child => {
      child.castShadow = true

      if (child.material) {
        child.material = this.libertyExMaterial
        child.customDepthMaterial = extendMaterial( THREE.MeshDepthMaterial, {
          template: this.libertyExMaterial
        });
      }

      if (child.geometry) {
        this.setGeometry(child);
      }
    })
    this.libertyExMaterial.uniforms.progress.value = 1
    this.libertyExMaterial.uniforms.uScale.value = 20.0

    this.currentObject = this.dancer
  }
  makeExtendMaterial = () => {
    const exMaterial = extendMaterial( THREE.MeshStandardMaterial, {
      class: CustomMaterial,
      vertexHeader: `
        attribute float aRandom;
        attribute vec3 aCenter;
        uniform float uTime;
        uniform float progress;
        uniform float uScale;
        
        mat4 rotationMatrix(vec3 axis, float angle) {
          axis = normalize(axis);
          float s = sin(angle);
          float c = cos(angle);
          float oc = 1.0 - c;
          
          return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                      0.0,                                0.0,                                0.0,                                1.0);
        }

        vec3 rotate(vec3 v, vec3 axis, float angle) {
          mat4 m = rotationMatrix(axis, angle);
          return (m * vec4(v, 1.0)).xyz;
        }
      `,
      vertex: {
        transformEnd: `
        
          float prog = (position.y + 100.0)/2.0;
          float locprog = clamp((progress - 0.9*prog)/0.1, 0.0, 1.0);
          
          locprog = progress;
        
          transformed = transformed-aCenter; // normalize
          transformed += uScale*normal*aRandom*(locprog);
          
          transformed *= (1.0 - locprog); // scale
          
          transformed += aCenter; // bring back
          
          transformed = rotate(transformed, vec3(0.0, 1.0, 0.0), aRandom*(locprog)*3.14*3.0); // rotate
        `
      },
      uniforms: {
        roughness: 0.75,
        uTime: {
          mixed: true,
          linked: true,
          value: this.params.uTime
        },
        progress: {
          mixed: true,
          linked: true,
          value: this.params.progress
        },
        uScale: {
          mixed: true,
          linked: true,
          value: 0.0
        }
      }
    });
    exMaterial.uniforms.diffuse.value = new THREE.Color(0xe5e1d6)

    // debug
    if (this.debug.active) {
      this.debug.ui.add(this.params, "progress", 0, 1, 0.01).onChange(val => {
        exMaterial.uniforms.progress.value = val
      });
    }

    //
    this.dancerExMaterial = exMaterial.clone()
    this.libertyExMaterial = exMaterial.clone()
  }
  setGeometry = (object) => {
    object.geometry = object.geometry.toNonIndexed()
    let geometry = object.geometry

    const len = geometry.attributes.position.count

    const randoms = new Float32Array(len*1)
    const centers = new Float32Array(len*3)

    for(let i=0; i<len; i+=3) {
      let r = Math.random()
      randoms[i] = r;
      randoms[i+1] = r;
      randoms[i+2] = r;

      let x = geometry.attributes.position.array[i*3]
      let y = geometry.attributes.position.array[i*3+1]
      let z = geometry.attributes.position.array[i*3+2]

      let x1 = geometry.attributes.position.array[i*3+3]
      let y1 = geometry.attributes.position.array[i*3+4]
      let z1 = geometry.attributes.position.array[i*3+5]

      let x2 = geometry.attributes.position.array[i*3+6]
      let y2 = geometry.attributes.position.array[i*3+7]
      let z2 = geometry.attributes.position.array[i*3+8]

      // get average of those 3 vectors
      let center = new THREE.Vector3(x,y,z).add(new THREE.Vector3(x1,y1,z1)).add(new THREE.Vector3(x2,y2,z2)).divideScalar(3)

      centers.set([center.x, center.y, center.z], i*3)
      centers.set([center.x, center.y, center.z], (i+1)*3)
      centers.set([center.x, center.y, center.z], (i+2)*3)
    }
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
    geometry.setAttribute('aCenter', new THREE.BufferAttribute(centers, 3))
  }
  show = (object) => {
    if (object.name === 'Dancer') {
      this.animate(this.dancerExMaterial, this.libertyExMaterial)

      setTimeout(() => {
        this.button1.classList.remove('active')
        this.button1.style.pointerEvents ='none'

        this.button2.classList.add('active')
        this.button2.style.pointerEvents ='all'
      }, 6000)
    }
    if (object.name === 'Liberty') {
      this.animate(this.libertyExMaterial, this.dancerExMaterial)

      setTimeout(() => {
        this.button2.classList.remove('active')
        this.button2.style.pointerEvents ='none'

        this.button1.classList.add('active')
        this.button1.style.pointerEvents ='all'
      }, 6000)
    }
  }
  animate = (materialFrom, materialTo) => {
    this.playSound()

    let progressFrom = materialFrom.uniforms.progress // 0~1
    let progressTo = materialTo.uniforms.progress     // 1~0

    const material_tl = gsap.timeline()

    material_tl.to(progressFrom, {
      duration: 3.0,
      value: 1,
      ease: "Quad.easeOut",
      onUpdate: () => {
        gsap.to(this.camera.position, {
          duration: 1.5,
          y: 2,
          z: this.camera.position.z-this.camera.position.z,
          ease: "Quad.easeOut",
        })
      }
    })
    .to(progressTo, {
      duration: 3.0,
      value: 0,
      ease: "Quad.easeOut",
      onUpdate: () => {
        gsap.to(this.camera.position, {
          duration: 1.5,
          x: 2,
          y: 2,
          z: 4,
          ease: "Quad.easeOut",
        })
      },
      onComplete: () => {
        this.sound.dispose()
        this.experience.playAmbient()
      }
    })
  }
  playSound = () => {
    const buffer = this.resources.items.particleFadeIn
    this.sound.play(buffer, false, 1.0, 0)
  }
  update = () => {
    // let val = this.dancerExMaterial.uniforms.progress.value // 0:show ~ 1:hide
    // if (val <= 1) {
    //   this.dancerExMaterial.uniforms.progress.value += 0.01
    // }
  }
}
