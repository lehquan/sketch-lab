import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

class Grass {
  constructor() {
    this.count = 5000
    this.clock = new THREE.Clock()
    this.leavesMaterial = null
    
    this.init()
  }
  
  init = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    
    // camera
    this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    this.camera.position.set(0, 5, 8);
    
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xaaaaaa, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.physicallyCorrectLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1e2243)
    
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
    
    this.#addGrass()
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  #addGrass = () => {
    const geo = new THREE.PlaneGeometry(0.1, 1, 1, 4)
    
    const uniforms = {
      time: {
        value: 0,
      },
    };
    this.leavesMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.DoubleSide,
    });
    
    this.grassMesh = new THREE.InstancedMesh(geo, this.leavesMaterial, this.count)
    this.scene.add(this.grassMesh)
  
    // Position and scale the grass blade instances randomly.
    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.count; i++) {
      dummy.position.set(
          (Math.random() - 0.5) * 10,
          0,
          (Math.random() - 0.5) * 10
      );
    
      dummy.scale.setScalar(0.5 + Math.random() * 0.5);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();
    
      this.grassMesh.setMatrixAt(i, dummy.matrix);
    }
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.#render();
  };
  
  #render = () => {
    // Handle a time variable to vertex shader for wind displacement.
    this.leavesMaterial.uniforms.time.value = this.clock.getElapsedTime();
    this.leavesMaterial.uniformsNeedUpdate = true
    
    requestAnimationFrame(this.#render)
    this.renderer.render(this.scene, this.camera);
  };
}

export { Grass }
