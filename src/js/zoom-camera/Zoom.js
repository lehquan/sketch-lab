import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

class Zoom {
  constructor() {
    this.WIDTH = window.innerWidth
    this.HEIGHT = window.innerHeight
    this.loader = new GLTFLoader()
    this.params = {
      Models: 'Helmet'
    };
    this.modelOptions = {
      Drone: 'assets/model/drone.glb',
      Fish: 'assets/model/fish.glb',
      Flamingo: 'assets/model/Flamingo.glb',
      Helmet: 'assets/model/helmet.glb',
    };
    
    this.#initScene()
  }
  
  // Initialize Scene and Environment
  #initScene = () => {
    // camera
    this.camera = new THREE.PerspectiveCamera(
        45,
        this.WIDTH / this.HEIGHT,
        0.1,
        1e27
    );
    this.camera.position.set(0, 0, 5)
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1e2243)
    
    // renderer
    const container = document.createElement("div");
    container.classList.add('container')
    document.body.appendChild(container);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xaaaaaa, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
    
    // envMap
    new RGBELoader().load('assets/texture/royal_esplanade_1k.hdr', texture => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      this.scene.environment = texture
    })
    
    // lights
    const dir = new THREE.DirectionalLight(0xffffff, 1)
    dir.position.set(1.5, 1.2, 0)
    dir.castShadow = true
    this.scene.add( dir)
    // const cameraHelper = new THREE.CameraHelper(dir.shadow.camera);
    // this.scene.add(cameraHelper);
    
    // ground
    const planeGeometry = new THREE.PlaneGeometry(1, 1);
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc, transparent: true, opacity: 0.2});
    const ground = new THREE.Mesh(planeGeometry, planeMaterial);
    ground.receiveShadow = true;
    ground.rotation.x = -0.5 * Math.PI; // -90º
    ground.scale.setScalar(50)
    ground.position.set(0, -1, 0)
    this.scene.add(ground);
    
    // controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false
    this.controls.target.set(0, 0, -0.2);
    this.controls.update();
  }
  
  build = async () => {
    
    // load model
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('lib/vendor/draco/gltf/')
    dracoLoader.preload()
    this.loader.setDRACOLoader(dracoLoader)
    await this.loadModel(this.modelOptions.Helmet)
    
    // ui
    this.#createGUI()
    
    window.addEventListener("resize", this.#onWindowResize);
    this.#animate()
  };
  
  //
  #createGUI = () => {
    const gui = new GUI();
    
    gui.add( this.params, 'Models', Object.keys( this.modelOptions ) )
    .onChange(  async ev => {
      await this.loadModel(this.modelOptions[ev])
    });
    
    gui.open()
  }
  
  /**
   * Load gltf model by {url}
   * @param url
   */
  loadModel = (url) => {
    const found = this.scene.children.find(child => child.type === 'Model')
    if (found) this.scene.remove(found)
    
    return new Promise(resolve => {
      this.loader.load(url, gltf => {
        
        // for shadow
        gltf.scene.traverse(child => {
          child.isMesh && (child.receiveShadow = child.castShadow = true);
          if (child.material) {
            child.material.side = THREE.DoubleSide
            child.material.depthTest = true
            child.material.depthWrite = true
            child.material.needsUpdate = true
          }
        })
        gltf.scene.type = 'Model'
        
        // Fit camera into model right after model is loaded
        this.#fitCameraToObject( gltf.scene )
        
        gltf.scene.add( new THREE.AxesHelper() )
        this.scene.add( gltf.scene );
        
        resolve(gltf.scene)
      })
    })
  }
  
  /**
   * Fit camera viewport into object
   * Discussion: https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/25
   * @param object
   * @param fitOffset
   */
  #fitCameraToObject = ( object, fitOffset = 1.2) => {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    const box = new THREE.Box3();
    
    box.makeEmpty();
    box.expandByObject(object);
    
    box.getSize(size);
    box.getCenter(center );
    
    const maxSize = Math.max(size.x, size.y, size.z);
    if (maxSize < .1 ) {
      fitOffset = 100
    }
    else if (maxSize > 300) {
      console.warn("Model is very large. Scale to 2 meters?")
      fitOffset = fitOffset / 2
    }
    
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * this.camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / this.camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);
    
    const direction = this.controls.target.clone()
    .sub(this.camera.position)
    .normalize()
    .multiplyScalar(distance);
    
    this.controls.maxDistance = distance * 10;
    this.controls.target.copy(center);
    
    this.camera.near = distance / 100;
    this.camera.far = distance * 100;
    this.camera.updateProjectionMatrix();
    
    this.camera.position.copy(this.controls.target).sub(direction);
    
    this.controls.update();
  }
  
  #onWindowResize = () => {
    this.camera.aspect = this.WIDTH /this.HEIGHT;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
  };
  
  #animate = () => {
    requestAnimationFrame(this.#animate)
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

export { Zoom }
