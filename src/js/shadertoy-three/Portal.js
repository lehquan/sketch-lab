import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import fragmentShader from "./glsl/fragment.glsl";
import vertexShader from "./glsl/vertex.glsl";

class Portal {
  constructor() {
    
    this.setScene()
    this.setCamera()
    this.setRenderer()
    this.setControls()
    
    this.on()
    this.build()
  }
  
  setScene = () => {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1e2243)
  }
  
  setCamera = () => {
    this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    this.camera.position.set(0, 0, 5);
  }
  
  setRenderer = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
  
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xaaaaaa, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
  }
  
  setControls = () => {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update()
  };
  
  build = () => {
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial())
    this.mesh.scale.setScalar(10)
    this.scene.add(this.mesh)
    
    this.mesh.material = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms:
          {
            iTime: { value: 0 },
            iChannel0: {
              value: new THREE.TextureLoader().load('assets/greynoise.png')
            },
            iResolution: {
              value: new THREE.Vector2(1,1)
            },
          },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    })
    this.mesh.material.needsUpdate = true
  }
  
  on = () => {
    this.update()
    window.addEventListener('resize', this.windowResize);
  };
  
  windowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.update();
  };
  
  update = () => {
    if(this.mesh) this.mesh.material.uniforms.iTime.value = performance.now() / 1000
    
    requestAnimationFrame(this.update)
    this.renderer.render(this.scene, this.camera);
  };
}

export { Portal }
