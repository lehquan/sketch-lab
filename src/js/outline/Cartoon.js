import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

class Cartoon {
  constructor() {}
  
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
    this.camera.position.set(0, 0, 5);
    
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xaaaaaa, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xC6C1B9)
    
    // lights
    const ambientL = new THREE.AmbientLight(0xfae7e7, .5)
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5)
    dirLight1.position.set(10, 10, 5)
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1)
    dirLight2.position.set(0, 10, 5)
    const pointL = new THREE.PointLight(0xffffff, 1)
    pointL.position.set(0, -10, 5)
    this.scene.add(ambientL, dirLight1, dirLight2, pointL)
  
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update()
    
    this.#addOutline()
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  #addOutline = () => {
    const group = new THREE.Group()
    
    const geo = new THREE.TorusKnotBufferGeometry(0.6, 0.1, 100, 32)
    const mat1 = new THREE.MeshLambertMaterial({color: 'black', side: THREE.BackSide})
  
    // Fix the Normals of the material shader instead of scale up the mesh
    mat1.onBeforeCompile = shader => {
      const token = '#include <begin_vertex>'
      const customTransform = `vec3 transformed = position + objectNormal*0.02;`
      shader.vertexShader = shader.vertexShader.replace(token, customTransform)
    }
    const mesh1 = new THREE.Mesh(geo, mat1)
    
    const mat2 = new THREE.MeshPhongMaterial({color: 'yellow', side: THREE.FrontSide})
    const mesh2 = new THREE.Mesh(geo, mat2)
    group.add(mesh1, mesh2)
    this.scene.add(group)
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

export { Cartoon }
