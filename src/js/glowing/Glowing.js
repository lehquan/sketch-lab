import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls';
import fragmentShader from './shaders/fragmentShader.glsl'
import vertexShader from './shaders/vertexShader.glsl'

class Glowing {
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
    this.camera.position.set(0, 0, 100);
    
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
    this.scene.background = new THREE.Color(0x1e2243)
    
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update();
    
    this.#addObject();
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  #addObject = () => {
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        "s": { type: "f", value: -1.0},
        "b": { type: "f", value: 1.0},
        "p": { type: "f", value: 1.0},
        glowColor: { type: "c", value: new THREE.Color(0x00ffff)}
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    })
    
    // torus
    const torusGeo = new THREE.TorusKnotGeometry( 10, 3, 100, 32 )
    this.torus = new THREE.Mesh( torusGeo, shaderMaterial );
    this.torus.rotation.y = Math.PI/180 * 30
    this.torus.position.x = -40
    this.scene.add( this.torus );
    
    // capsule
    const capsuleGeo = new THREE.CapsuleGeometry( 10, 10, 4, 32 );
    this.capsule = new THREE.Mesh( capsuleGeo, shaderMaterial );
    this.scene.add( this.capsule );
    
    const coneGeo = new THREE.ConeGeometry( 10, 20, 32 );
    this.cone = new THREE.Mesh( coneGeo, shaderMaterial );
    this.cone.position.x = 40
    this.scene.add( this.cone );
    
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.#render();
  };
  
  #render = () => {
    this.torus.rotation.x += 0.01
    this.torus.rotation.y += 0.01
    this.torus.rotation.z += 0.01
    
    this.capsule.rotation.x += 0.01
    this.capsule.rotation.y += 0.01
    this.capsule.rotation.z += 0.01
    
    this.cone.rotation.x += 0.01
    this.cone.rotation.y += 0.01
    this.cone.rotation.z += 0.01
    
    requestAnimationFrame(this.#render)
    this.renderer.render(this.scene, this.camera);
  };
}

export { Glowing }
