import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls'

class Glass {
  constructor() {
    this.group = new THREE.Group()
    this.materialEnvMap = new THREE.MeshPhysicalMaterial({
      metalness: 0,
      roughness: .5,
      transmission: 1,
      thickness: 1.5,
      envMapIntensity: 1.5
    })
    this.materialNormal = this.materialEnvMap.clone()
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
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfaf0e6)
    
    // lights
    const dirLight = new THREE.DirectionalLight(0xfff0dd, 1)
    dirLight.position.set(0, 5, 10)
    this.scene.add(dirLight)
    
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update()
    
    // backdrop
    const mat = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load('assets/texture.jpeg')
    })
    const backdrop = new THREE.Mesh( new THREE.PlaneGeometry(8, 8), mat)
    backdrop.position.set(0, 0, -1)
    this.group.add(backdrop)
    
    this.#setMaterial()
    this.#addObject()
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  #setMaterial = () => {
  
    new RGBELoader().load('assets/empty_warehouse_01_4k.hdr', texture => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      this.materialEnvMap.envMap = texture
    })
  
    new THREE.TextureLoader().load('assets/normal.jpg', texture => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    
      this.materialNormal.normalMap = texture
      this.materialNormal.clearcoatNormalMap = texture
      this.materialNormal.needsUpdate = true
    })
  }
  
  #addObject = () => {
  
    // mesh 1
    this.icoMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), this.materialEnvMap.clone())
    this.icoMesh.rotation.set(0, Math.PI/180 * 30, 0)
    this.icoMesh.position.set(-2.5, 0, 0)
    this.group.add(this.icoMesh)
  
    // mesh 2
    const mesh2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 15), this.materialEnvMap.clone())
    mesh2.material.roughness = 0.67
    mesh2.material.clearcoat = 1
    mesh2.material.clearcoatRoughness = 0.12
    mesh2.material.needsUpdate = true
    mesh2.rotation.set(0, Math.PI/180 * 30, 0)
    mesh2.position.set(0, 1.5, 0)
    this.group.add(mesh2)
    
    // mesh 3
    const geo = new RoundedBoxGeometry(1.5, 1.5, 1.5, 16, 0.2)
    this.roundedBox = new THREE.Mesh(geo, this.materialEnvMap.clone())
    this.roundedBox.position.set(2.5, 0, 0)
    this.roundedBox.material.roughness = 0.01
    this.roundedBox.material.needsUpdate = true
    this.group.add(this.roundedBox)
  
    // mesh 4
    this.tetra = new THREE.Mesh(new THREE.TetrahedronGeometry(1.3, 0), this.materialNormal.clone())
    this.tetra.rotation.set(0, Math.PI/180 * 30, 0)
    this.tetra.position.set(0, -1.5, 0)
    this.group.add(this.tetra)
    
    this.scene.add(this.group)
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.#render();
  };
  
  #render = () => {
    this.icoMesh.rotation.x = performance.now()/1000;
    this.icoMesh.rotation.y = performance.now()/1000;
  
    this.roundedBox.rotation.x = performance.now()/1000;
    this.roundedBox.rotation.y = performance.now()/1000;
    
    requestAnimationFrame(this.#render)
    this.renderer.render(this.scene, this.camera);
  };
}

export { Glass }
