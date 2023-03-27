import * as THREE from 'three'
import Experience from '../Experience'

export default class MakeZoom {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.camera = this.experience.camera.instance
    this.controls = this.experience.camera.controls
    this.debug = this.experience.debug

    this.modelsOpt = {
      Fox: this.resources.items.foxModel.scene,
      Drone: this.resources.items.drone.scene,
      Fish: this.resources.items.fish.scene,
      Flamingo: this.resources.items.flamingo.scene,
      Helmet: this.resources.items.helmet.scene,
      Pikachu: this.resources.items.pikachu.scene,
      Maltida: this.resources.items.maltida.scene,
      Totoromy: this.resources.items.totoromy.scene,
      Mushroom: this.resources.items.mushroom.scene,
      Biplane: this.resources.items.biplane.scene,
    }
    this.models = ['Helmet', 'Fox', 'Drone', 'Fish', 'Flamingo', 'Pikachu', 'Maltida', 'Mushroom', 'Biplane']
    this.api = { Model: 'Helmet' }
    this.currentModel = this.modelsOpt.Helmet
    this.isFitCameraToObject = false
    this.cameraDefault = {
      pos: this.camera.position,
      near: this.camera.near,
      far: this.camera.far,
    }

    this.setGround()
    this.setModels()
    this.setFooter()
    this.setDebug()
  }
  setFooter = () => {
    const footer = document.getElementById('footer')

    const title = document.createElement('p')
    title.classList.add('title')
    title.innerHTML = 'Zoom camera to fit the object scale. This example is based on ' +
        '<a href="https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/24" target="blank">the original implementation of @looeee.</a> '
    footer.appendChild(title)

    const info = document.createElement('p')
    info.innerHTML = 'USE DEBUG MODE (#debug) FOR MODEL SELECTIONS'
    footer.appendChild(info)

    const link = document.createElement('p')
    link.innerHTML = 'Models: ' +
        '<a href="#" target="blank">Sketchfab</a> '
    footer.appendChild(link)
  }
  setDebug = () => {
    if (this.debug.active) {
      this.debug.ui.add(this.api, 'Model').
          options(this.models).
          onChange(val => {
            // dispose
            this.experience.dispose(this.currentModel)

            switch (val) {
              case 'Helmet':
                this.currentModel = this.modelsOpt.Helmet
                break;
              case 'Fox':
                this.currentModel = this.modelsOpt.Fox
                break;
              case 'Drone':
                this.currentModel = this.modelsOpt.Drone
                break;
              case 'Fish':
                this.currentModel = this.modelsOpt.Fish
                break;
              case 'Flamingo':
                this.currentModel = this.modelsOpt.Flamingo
                break;
              case 'Pikachu':
                this.currentModel = this.modelsOpt.Pikachu
                break;
              case 'Maltida':
                this.currentModel = this.modelsOpt.Maltida
                break;
              case 'Totoromy':
                this.currentModel = this.modelsOpt.Totoromy
                break;
              case 'Mushroom':
                this.currentModel = this.modelsOpt.Mushroom
                break;
              case 'Biplane':
                this.currentModel = this.modelsOpt.Biplane
                break;
            }

            // add
            this.currentModel.traverse(child => {
              child.isMesh && (child.receiveShadow = child.castShadow = true)
            })
            this.currentModel.scale.setScalar(1)
            this.currentModel.position.set(0, 0, 0)
            this.scene.add(this.currentModel)
            this.helper.setFromObject(this.currentModel)

            this.isFitCameraToObject ? this.zoomCameraToFitObject(this.currentModel) : this.resetCamera()
          })

      //
      const debugFolder = this.debug.ui.addFolder('Camera')
      const debugObject = {
        'FitToObject': this.isFitCameraToObject,
      };
      debugFolder.add(debugObject, 'FitToObject').onChange(val => {
        this.isFitCameraToObject = val
        val ? this.zoomCameraToFitObject(this.currentModel) : this.resetCamera()
      })
    }
  }
  setGround = () => {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshLambertMaterial(
            {color: 0xcccccc, transparent: true, opacity: 0.2}),
    );
    ground.receiveShadow = true;
    ground.rotation.x = -0.5 * Math.PI; // -90º
    ground.scale.setScalar(50);
    ground.position.set(0, -1, 0);
    this.scene.add(ground);
  }
  setModels = () => {
    this.currentModel.traverse(child => {
      child.isMesh && (child.receiveShadow = child.castShadow = true)
    })
    this.currentModel.scale.setScalar(1)
    this.currentModel.position.set(0, 0, 0)
    this.scene.add(this.currentModel)

    // helper
    this.helper = new THREE.BoxHelper( this.currentModel, 0xffff00 )
    this.scene.add( this.helper )
  }

  /**
   * Fit camera viewport into {object}
   * @param object
   * @param fitOffset
   */
  zoomCameraToFitObject = (object, fitOffset = 1.25) => {
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    const box = new THREE.Box3()

    box.setFromObject( object )
    box.getSize(size)
    box.getCenter(center )

    const maxSize = Math.max(size.x, size.y, size.z)
    console.log('maxSize: ', maxSize)
    if (maxSize < .1 ) {
      fitOffset = 100
    }
    else if (maxSize > 200) {
      console.warn("Model is very large. Scale to 2 meters?")
      fitOffset /= 2
    }

    console.log('fitOffset: ', fitOffset)

    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * this.camera.fov / 360))
    const fitWidthDistance = fitHeightDistance / this.camera.aspect
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance)

    const direction = this.controls.target.clone()
    .sub(this.camera.position)
    .normalize()
    .multiplyScalar(distance)

    this.controls.maxDistance = distance * 10
    this.controls.target.copy(center)

    this.camera.near = distance / 100
    this.camera.far = distance * 100
    this.camera.updateProjectionMatrix()

    this.camera.position.copy(this.controls.target).sub(direction)

    this.controls.update()
  }

  resetCamera = () => {
    this.camera.near = this.cameraDefault.near
    this.camera.far = this.cameraDefault.far
    this.camera.position.set(0, 0, 5)
    this.camera.updateProjectionMatrix()

    this.controls.target.set(0, 0, 0)
    this.controls.update()
  }

  update = () => {}
}
