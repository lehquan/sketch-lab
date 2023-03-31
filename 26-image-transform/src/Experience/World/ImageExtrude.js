import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader'
import Experience from '../Experience'

export default class ImageExtrude {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources

    this.extrudeSettings = {
      steps: 2,
      depth: 4,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 0,
      bevelOffset: 0,
      bevelSegments: 1,
    }
    this.SVGParams = {
      drawFillShapes: true,
      drawStrokes: true,
    }
    this.setEnv()
    this.setIcon()
    this.setFooter()
  }
  setFooter = () => {
    const footer = document.getElementById('footer')

    const title = document.createElement('p')
    title.classList.add('title')
    title.innerHTML = 'Extrude SVG to make 3D object. This example is based on ' +
        '<a href="https://muffinman.io/blog/three-js-extrude-svg-path/" target="blank">the original tutorial.</a> '
    footer.appendChild(title)

    const info = document.createElement('p')
    info.innerHTML = 'USE DEBUG MODE (#debug) FOR MODEL SELECTIONS'
    // footer.appendChild(info)

    const link = document.createElement('p')
    link.innerHTML = 'Models: ' +
        '<a href="#" target="blank">Sketchfab</a> '
    // footer.appendChild(link)
  }
  setEnv = () => {
    this.camera.position.set(0, 3, 10)
    this.scene.background = new THREE.Color(0x000000)

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5)
    dirLight1.position.set(10, 10, 5)
    this.scene.add(dirLight1)
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1)
    dirLight2.position.set(0, 10, 5)
    this.scene.add(dirLight2)
    const pointL = new THREE.PointLight(0xffffff, 1)
    pointL.position.set(0, -10, 5)
    this.scene.add(pointL)
  }
  setIcon = () => {
    const paths = this.resources.items.icon.paths

    // Group that will contain all of our paths
    this.svgGroup = new THREE.Group()

    for(let i=0; i<paths.length; i++) {
      const path = paths[i]
      const fillColor = path.userData.style.fill

      if (this.SVGParams.drawFillShapes && fillColor !== undefined && fillColor !== 'none') {
        const shapes = SVGLoader.createShapes(path)

        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j]
          // const geometry = new THREE.ShapeGeometry(shape) // Use this for 2D shape
          const geometry = new THREE.ExtrudeGeometry(shape, this.extrudeSettings) // Change to 3D shape
          geometry.center()
          const mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({
            side: THREE.DoubleSide
          }))
          this.svgGroup.add(mesh)
        }
      }
    }

    //
    this.svgGroup.rotation.set(Math.PI/180 * -180, Math.PI/180 * 30, 0)
    this.svgGroup.scale.setScalar(0.3)
    this.scene.add(this.svgGroup)
  }
  update = () => {
    if(this.svgGroup) {
      this.svgGroup.rotation.y = performance.now()/ 2000
    }
  }
}
