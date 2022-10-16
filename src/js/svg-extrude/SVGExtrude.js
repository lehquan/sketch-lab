import * as THREE from 'three'
import{ SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import {OrbitControls} from 'three/addons/controls/OrbitControls'

class SVGExtrude {
  constructor() {
    this.loader = new SVGLoader()
    this.SVGParams = {
      drawFillShapes: true,
      drawStrokes: true,
    }
    this.extrudeSettings = {
      steps: 2,
      depth: 4,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 0,
      bevelOffset: 0,
      bevelSegments: 1,
    }
    this.shape = null
    
    this.init()
    this.addSVG().then()
  }
  
  init = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    
    // camera
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    this.camera.position.set(0, 0, 10);
    
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xaaaaaa, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1e2243)
    
    // lights
    const ambientL = new THREE.AmbientLight()
    ambientL.intensity = 0.5
    this.scene.add(ambientL)
    const dirLight1 = new THREE.DirectionalLight()
    dirLight1.intensity = 2.5
    dirLight1.position.set(10, 10, 5)
    this.scene.add(dirLight1)
    const dirLight2 = new THREE.DirectionalLight()
    dirLight2.intensity = 1
    dirLight2.position.set(0, 10, 5)
    this.scene.add(dirLight2)
    const pointL = new THREE.PointLight()
    pointL.intensity = 1
    pointL.position.set(0, -10, 5)
    this.scene.add(pointL)
    
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update()
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  }
  
  addSVG = async () => {
    const res = await this.loadSVG('assets/icon.svg', this.extrudeSettings)
    this.shape = res.children[0]
    this.shape.scale.setScalar(0.1)
    this.shape.position.set(0, 0, -0.5)
    this.shape.rotation.set(Math.PI/180 * -180, 0, 0)
    
    this.scene.add(this.shape)
  }
  
  loadSVG = (url, extrudeSettings) => {
    return new Promise((resolve, reject) => {
      this.loader.load(url,  (data) => {
        const paths = data.paths
        // Group that will contain all of our paths
        const svgGroup = new THREE.Group()
        
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i]
          
          const fillColor = path.userData.style.fill
          if (this.SVGParams.drawFillShapes && fillColor !== undefined && fillColor !== 'none') {
            const shapes = SVGLoader.createShapes(path)
            
            for (let j = 0; j < shapes.length; j++) {
              const shape = shapes[j]
              // const geometry = new THREE.ShapeGeometry(shape) // Use this for 2D shape
              const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings) // Change to 3D shape
              const mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial())
              
              // Change pivot for object to center
              const center = new THREE.Vector3()
              mesh.geometry.computeBoundingBox()
              mesh.geometry.boundingBox.getCenter(center)
              mesh.geometry.center()
              mesh.position.copy(center)
              
              svgGroup.add(mesh)
            }
          }
        }
        resolve(svgGroup)
      })
    })
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.#render();
  }
  
  #render = () => {
    if (this.shape) {
      this.shape.rotation.y = this.shape.rotation.x = performance.now() / 1000
    }
    requestAnimationFrame(this.#render)
    this.renderer.render(this.scene, this.camera);
  }
}

export { SVGExtrude }
