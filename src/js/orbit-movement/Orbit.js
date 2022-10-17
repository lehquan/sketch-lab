import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls'

class Orbit {
  constructor() {
    this.loader = new THREE.TextureLoader()
    this.planet = {
      orbitRadius: 100,
      inclination: 23
    }
    this.init().then()
    this.earth().then()
    this.createPath().then()
  }
  
  init = async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
  
    // camera
    this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    this.camera.position.set(0, 0, 200);
  
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xaaaaaa, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
  
    // scene
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color(0x1e2243)
  
    // light
    let ambientLight = new THREE.AmbientLight("#ffffff", 1);
    this.scene.add(ambientLight, new THREE.PointLight());
  
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update()
  
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  earth = async () => {
    const geo = new THREE.SphereGeometry(15, 32, 16)
    const textureMap = await this.loader.load('assets/colorMap.jpg')
    const mat = new THREE.MeshStandardMaterial({
      map: textureMap,
      roughness: 1,
      metalness: 0
    })
    this.earthObj = new THREE.Mesh(geo, mat)
    this.earthObj.castShadow = true
    this.earthObj.receiveShadow = true
    this.earthObj.scale.setScalar(2)
    this.scene.add(this.earthObj)
  }
  
  createPath = async () => {
    const pts = new THREE.Path().absarc(0, 0, this.planet.orbitRadius, 0,
        Math.PI * 2).getPoints(90)
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    geo.rotateX(Math.PI * 0.5)
    const mat = new THREE.MeshBasicMaterial({
      color: 'gray',
      transparent: true,
      opacity: .6
    })
  
    this.line = new THREE.Line(geo, mat)
    this.scene.add(this.line)
  
    // moon
    const moonGeo = new THREE.SphereGeometry(5, 32, 16)
    const roughnessMap = await this.loader.load('assets/rock_boulder_dry_rough_1k.jpg')
    const moonMat = new THREE.MeshStandardMaterial({
      roughness: 1,
      aoMap: roughnessMap,
      map: roughnessMap,
    })
    this.moon = new THREE.Mesh(moonGeo, moonMat)
    this.moon.rotation.order = "YZX";
    this.line.add(this.moon)
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.#render();
  };
  
  #render = () => {
    let t = performance.now() / 1000
    
    if (this.moon) {
      this.moon.position.set(Math.cos(t), 0, -Math.sin(t)).multiplyScalar(this.planet.orbitRadius);
      this.moon.rotation.y = t - Math.PI * 0.5;
      this.moon.rotation.z = Math.PI * 0.5;
      
      this.line.rotation.x = performance.now() / 5000 + Math.PI
      this.line.rotation.y = performance.now() / 5000 + Math.PI
      this.line.rotation.z = performance.now() / 5000 + Math.PI
    }
    if (this.earthObj) {
      this.earthObj.rotation.y = this.earthObj.rotation.z = performance.now() / 2000
    }
  
    requestAnimationFrame(this.#render)
    this.renderer.render(this.scene, this.camera);
  };
}

export { Orbit }
