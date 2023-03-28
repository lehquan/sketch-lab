import * as THREE from 'three'
import { gsap } from 'gsap'
import Experience from '../Experience'
import { EVT } from '../../utils/contains'

export default class CameraTransform {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.controls = this.experience.camera.controls
    this.ray = this.experience.ray

    this.origin = this.experience.camera.origin
    this.setObjects()
    this.setFooter()

    window.addEventListener(EVT.RAY_INTERSECTED, this.transformCamToTarget)
  }
  setFooter = () => {
    const footer = document.getElementById('footer')

    const title = document.createElement('p')
    title.classList.add('title')
    title.innerHTML = 'Transform camera to the target using gsap animation.' + '<br>'
        + 'Click on the target to transform camera.'
    footer.appendChild(title)

    const info = document.createElement('p')
    info.innerHTML = 'USE DEBUG MODE (#debug) FOR TESTING BLOOMING'
    // footer.appendChild(info)

    const link = document.createElement('p')
    link.innerHTML = 'Credit: ' +
        '<a href="https://skfb.ly/HpVV" target="blank">Scifi Girl v.01</a> '
    // footer.appendChild(link)
  }

  setObjects = () => {
    const group = new THREE.Group()
    this.scene.add(group)

    const purple = new THREE.Mesh(new THREE.SphereGeometry(.2, 32, 32), new THREE.MeshLambertMaterial({color: 0x351c75}))
    purple.position.set(-1.76, 0, 2.89)
    group.add(purple)

    const red = new THREE.Mesh(new THREE.SphereGeometry(.1, 32, 32), new THREE.MeshLambertMaterial({color: 0xab0000}))
    red.position.set(.2, .1, -1.29)
    group.add(red)

    const green = new THREE.Mesh(new THREE.SphereGeometry(.2, 32, 32), new THREE.MeshLambertMaterial({color: 0x009900}))
    green.position.set(1.6, .1, .8)
    group.add(green)

    const orange = new THREE.Mesh(new THREE.SphereGeometry(.4, 32, 32), new THREE.MeshLambertMaterial({color: 0xFFA500}))
    orange.position.set(-.6, .25, 1.8)
    group.add(orange)

    const pink = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 32), new THREE.MeshLambertMaterial({color: 0x9900cc}))
    pink.position.set(-2.6, .21, -3.2)
    group.add(pink)

    const yellow = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 32), new THREE.MeshLambertMaterial({color: 0xFFFF00}))
    yellow.position.set(2, .3, -2.8)
    group.add(yellow)

    const blue = new THREE.Mesh(new THREE.SphereGeometry(.25, 32, 32), new THREE.MeshLambertMaterial({color: 0x99ccff}))
    blue.position.set(2, 0, 3.5)
    group.add(blue)

    // ray
    this.ray.setTarget(group)
  }

  transformCamToTarget = ev => {
    const target = ev.detail

    this.controls.enabled = false

    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()

    target.matrix.decompose( position, quaternion, scale )
    const bbox = new THREE.Box3().setFromObject(target)
    const center = bbox.getCenter(new THREE.Vector3())
    const size = bbox.getSize(new THREE.Vector3())

    gsap.to(this.camera.position, {
      duration: 1.5,
      x: position.x,
      y: position.y,
      z: center.z + size.z * 2,
      onUpdate: () => {
        this.camera.lookAt(center)
        this.camera.updateProjectionMatrix()
        this.controls.enabled = false
        this.controls.update()
      },
    })
    gsap.to(this.controls.target, {
      duration: 1.5,
      x: position.x,
      y: position.y,
      z: position.z,
      onUpdate: () => {
        this.controls.update()
      },
      onComplete: () => {
        setTimeout(() => {
          this.resetCamera()
        }, 1000)
      }
    })
  }

  resetCamera = () => {
    const dummy = new THREE.Object3D()
    this.origin.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)

    gsap.to(this.camera.position, {
      duration: 1,
      x: dummy.position.x,
      y: dummy.position.y,
      z: dummy.position.z,
      onUpdate: () => {
        this.camera.lookAt(0, 0, 0)
        this.camera.updateProjectionMatrix()
        this.controls.update()
      },
      onComplete: () => {
        this.controls.enabled = true
      },
    })
    gsap.to(this.controls.target, {
      duration: 1,
      x: 0,
      y: 0,
      z: 0,
      onUpdate: () => {
        this.controls.update()
      },
      onComplete: () => {
        this.controls.enabled = true
      }
    })
  }

  update = () => {}
}
