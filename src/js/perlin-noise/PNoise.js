import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {noise} from './perlin'

class PNoise {
  constructor() {
    this.init()
    this.addTerrain()
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
    this.camera.position.set(0, 10, 20);
    this.camera.zoom = 30
    
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xaaaaaa, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffd5c0)
    
    // lights
    const ambientL = new THREE.AmbientLight()
    ambientL.position.set(0, 4, 0)
    ambientL.intensity = 0.3
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
    const pointLight1 = new THREE.PointLight(0xffcc77, 1)
    pointLight1.position.set(-6, 3 ,-6)
    const pointLight2 = new THREE.PointLight(0xffcc77, 1)
    pointLight2.position.set(6, 3, 6)
    this.scene.add(ambientL, dirLight, pointLight1, pointLight2)
    
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableZoom = false
    controls.update()
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  addTerrain = () => {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(55, 55, 100, 100),
        new THREE.MeshPhongMaterial({
          color: 'hotpink',
          side: THREE.DoubleSide,
          specular: 'hotpink',
          shininess: 1,
          flatShading: true
        }))
    this.scene.add(mesh)
    mesh.rotation.set( Math.PI/180 * 90, 0, 0)
    
    // make noise
    noise.seed(Math.random())
    let pos = mesh.geometry.getAttribute('position')
    let pa = pos.array
    const hVerts = mesh.geometry.parameters.heightSegments + 1
    const wVerts = mesh.geometry.parameters.widthSegments  + 1
  
    for (let j=0; j < hVerts; j++) {
      for (let i=0; i < wVerts; i++) {
        const ex = 1.3; // change the weight of noise
        pa[3 * (j * wVerts + i) + 2] =
            (noise.simplex2(i / 100, j / 100) +
                noise.simplex2((i + 200) / 50, j / 50) * Math.pow(ex, 1) +
                noise.simplex2((i + 400) / 25, j / 25) * Math.pow(ex, 2) +
                noise.simplex2((i + 600) / 12.5, j / 12.5) * Math.pow(ex, 3) +
                +(noise.simplex2((i + 800) / 6.25, j / 6.25) * Math.pow(ex, 4))) /
            2;
      }
    }
    pos.needsUpdate = true
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.#render();
  };
  
  #render = () => {
    
    requestAnimationFrame(this.#render)
    this.renderer.render(this.scene, this.camera);
  };
}

export { PNoise }
