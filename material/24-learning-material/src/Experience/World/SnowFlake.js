import * as THREE from 'three'
import { FlakesTexture } from 'three/addons/textures/FlakesTexture'
import Experience from '../Experience'

export default class SnowFlake {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.renderer = this.experience.renderer.instance
    this.controls = this.camera.controls
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.params = {
      clearcoat: 1.0,
      roughness: 0.5,
      metalness: 0.9,

      offsetX: 0,
      offsetY: 0,
      rotation: Math.PI / 4, // positive is counter-clockwise
      centerX: 0.5,
      centerY: 0.5,
      repeatX: 10,
      repeatY: 6,
      normalScaleX: 0.15,
      normalScaleY: 0.15,
      Model: 'Statue',
    }
    this.models = ['Sphere', 'Statue', 'Helmet']

    this.setEnvironment()
    this.setMaterial()
    this.setObjects()
    this.setDebug()
    this.setFooter()
  }
  setFooter = () => {
    const footer = document.getElementById('footer')

    const title = document.createElement('p')
    title.classList.add('title')
    title.innerHTML = 'Using THREE.FlakesTexture for PhysicalMaterial to create realistic material reflection. ' +
        '<br>' +
        'This is based on ' +
        '<a href="https://redstapler.co/three-js-realistic-material-reflection-tutorial/" target="blank">the original tutorial on Redstapler.</a> '
    footer.appendChild(title)

    const info = document.createElement('p')
    info.innerHTML = 'USE DEBUG MODE (#debug) FOR TESTING MATERIAL'
    footer.appendChild(info)

    const link = document.createElement('p')
    link.innerHTML = 'Models: ' +
        '<a href="https://threejs.org/" target="blank">Damaged Helmet</a>, ' +
        '<a href="https://skfb.ly/o8RJv" target="blank">Girl Statue</a>'
    footer.appendChild(link)
  }
  setEnvironment = () => {
    // this.controls.enableZoom = false
    this.camera.instance.position.set(0, 0, 5)

    // env
    this.scene.environment = this.experience.environment.envTexture
  }
  setMaterial = () => {
    const texture = new THREE.CanvasTexture(new FlakesTexture())
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.x = this.params.repeatX
    texture.repeat.y = this.params.repeatY
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
    // texture.matrixAutoUpdate = false // update texture manually

    this.material = new THREE.MeshPhysicalMaterial({
      clearcoat: this.params.clearcoat,
      roughness: this.params.roughness,
      metalness: this.params.metalness,
      color: 0xFC2947,
      normalMap: texture,
      normalScale: new THREE.Vector2(0.15, 0.15),
    })
  }
  setObjects = () => {
    // sphere
    this.sphere = new THREE.Mesh(
        new THREE.SphereGeometry(2, 64, 64),
        this.material)

    // helmet
    this.helmet = this.resources.items.helmet.scene
    this.helmet.rotation.set(0, Math.PI/180 * -45, 0)
    this.helmet.scale.setScalar(2)
    this.helmet.traverse(child => {
      if (child.material) child.material = this.material
    })

    // statue
    this.statue = this.resources.items.statue.scene
    this.statue.rotation.set(0, Math.PI/180 * 180, 0)
    this.statue.position.set(0, -2.5, 0)
    this.statue.scale.setScalar(1.5)
    this.statue.traverse(child => {
      if (child.material) child.material = this.material
    })
    this.scene.add(this.statue)
    this.selected = this.statue
  }
  setDebug = () => {
    if (!this.debug.active) return;

    this.debug.ui.add(this.params, 'Model').
        options(this.models).
        onChange(val => {
          switch (val) {
            case 'Sphere':
              this.experience.dispose(this.helmet)
              this.experience.dispose(this.statue)

              this.selected = this.sphere
              break;
            case 'Statue':
              this.experience.dispose(this.helmet)
              this.experience.dispose(this.sphere)

              this.selected = this.statue
              break;
            case 'Helmet':
              this.experience.dispose(this.sphere)
              this.experience.dispose(this.statue)

              this.selected = this.helmet
              break;
          }

          this.scene.add(this.selected)
        })

    const materialFolder = this.debug.ui.addFolder('MeshPhysicalMaterial : NormalMap')
    materialFolder.add(this.params, 'clearcoat', 0.0, 1.0, 0.001).onChange(this.updateUvTransform)
    materialFolder.add(this.params, 'roughness', 0.0, 1.0, 0.001).onChange(this.updateUvTransform)
    materialFolder.add(this.params, 'metalness', 0.0, 1.0, 0.001).onChange(this.updateUvTransform)

    const textureFolder = this.debug.ui.addFolder('MeshPhysicalMaterial : NormalMap : Texture')
    textureFolder.add(this.params, 'offsetX', 0.0, 1.0).onChange(this.updateUvTransform)
    textureFolder.add(this.params, 'offsetY', 0.0, 1.0).onChange(this.updateUvTransform)
    textureFolder.add(this.params, 'repeatX', 0.0, 10.0).onChange(this.updateUvTransform)
    textureFolder.add(this.params, 'repeatY', 0.0, 10.0).onChange(this.updateUvTransform)
    textureFolder.add(this.params, 'rotation', -2.0, 2.0).onChange(this.updateUvTransform)
    textureFolder.add(this.params, 'centerX', 0.0, 1.0).onChange(this.updateUvTransform)
    textureFolder.add(this.params, 'centerY', 0.0, 1.0).onChange(this.updateUvTransform)
  }

  updateUvTransform = () => {

    if (this.selected.isMesh) { // normal mesh
      // material
      this.selected.material.clearcoat = this.params.clearcoat
      this.selected.material.roughness = this.params.roughness
      this.selected.material.metalness = this.params.metalness

      // texture
      const texture = this.selected.material.normalMap
      texture.offset.set(this.params.offsetX, this.params.offsetY)
      texture.repeat.set(this.params.repeatX, this.params.repeatY)
      texture.center.set(this.params.centerX, this.params.centerY)
      texture.rotation = this.params.rotation
    }
    else {
      this.selected.traverse(child => { // for models
        if (child.material) {
          // material
          child.material.clearcoat = this.params.clearcoat
          child.material.roughness = this.params.roughness
          child.material.metalness = this.params.metalness

          // texture
          const texture = child.material.normalMap
          if (texture.matrixAutoUpdate) {
            texture.offset.set(this.params.offsetX, this.params.offsetY)
            texture.repeat.set(this.params.repeatX, this.params.repeatY)
            texture.center.set(this.params.centerX, this.params.centerY)
            texture.rotation = this.params.rotation
          } else {
            // another way...
            texture.matrix.identity().
                translate(-this.params.centerX, -this.params.centerY).
                rotate(this.params.rotation).
                scale(this.params.repeatX, this.params.repeatY).
                translate(this.params.centerX, this.params.centerY).
                translate(this.params.offsetX, this.params.offsetY)
          }
        }
      })
    }
  }
}
