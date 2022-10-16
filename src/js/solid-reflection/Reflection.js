import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
// import { Reflector } from 'three/examples/jsm/objects/Reflector'
import { Reflector } from './Reflector';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Reflection {
  constructor() {
    
    this.initScene()
    this.addLight()
    this.addModel()
    this.addGround()
    this.addMirror()
  }
  
  initScene = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    
    // camera
    this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    this.camera.position.set(-6, 4, 10);
    
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.VSMShadowMap
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFFC0CB)
    new RGBELoader().load('assets/venice_sunset_1k.hdr', texture => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      this.scene.environment = texture
    })
    
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update()
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  addLight = () => {
  
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3)
    dirLight1.position.set(-5, 8, 0)
    dirLight1.castShadow = true
    // dirLight1.shadow.mapSize.width = 1024;
    // dirLight1.shadow.mapSize.height = 1024;
    // dirLight1.shadow.camera.far = 50;
    // dirLight1.shadow.camera.left = -10;
    // dirLight1.shadow.camera.right = 10;
    // dirLight1.shadow.camera.top = 10;
    // dirLight1.shadow.camera.bottom = -10;
  
    dirLight1.shadow.mapSize.width = 256
    dirLight1.shadow.mapSize.height = 256
    dirLight1.shadow.camera.near = 0.5
    dirLight1.shadow.camera.far = 25
    dirLight1.shadow.camera.left = -10
    dirLight1.shadow.camera.right = 10
    dirLight1.shadow.camera.top = 10
    dirLight1.shadow.camera.bottom = -10
    dirLight1.shadow.radius = 5
    dirLight1.shadow.blurSamples = 25
    
    this.scene.add(dirLight1)
  
    const dirLight2 = new THREE.DirectionalLight()
    dirLight2.zoom = 0.1
    dirLight2.position.set(-0.5, 2 ,2)
    this.scene.add(dirLight2)
    
    const ambientL = new THREE.AmbientLight(0xf2709c)
    this.scene.add(ambientL)
    
    const pointLight1 = new THREE.PointLight(0xf2709c, 5)
    pointLight1.angle = 10
    pointLight1.position.set(-10, -5, 5)
    this.scene.add(pointLight1)
  
    const pointLight2 = new THREE.PointLight(0xf2709c, 5)
    pointLight2.angle = 10
    pointLight2.position.set(10, -5, 5)
    this.scene.add(pointLight2)
  
    const pointLight3 = new THREE.PointLight(0xf2709c, 5)
    pointLight3.angle = 1
    pointLight3.position.set(0, 2.5, 0)
    this.scene.add(pointLight3)
  }
  
  addModel = () => {
    new GLTFLoader().load('assets/model/skull.glb', gltf => {
      gltf.scene.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      const model = gltf.scene
      model.rotation.set(0, Math.PI/180 * -120, 0)
      model.scale.setScalar(3)
      this.scene.add(model)
    })
  }
  
  addGround = () => {
    const material = new THREE.ShadowMaterial({
      transparent: true,
      opacity: .6
    })
    
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), material)
    ground.receiveShadow = true
    ground.rotation.set(-Math.PI/2, 0, 0)
    ground.position.set(0, -2.75, 0)
    this.scene.add(ground)
  }
  
  addMirror = () => {
    const geo = new THREE.PlaneGeometry(8, 8)
    const mirror = new Reflector(geo, {
      textureWidth: 1024 * window.devicePixelRatio,
      textureHeight: 1024 * window.devicePixelRatio,
      color: new THREE.Color(0xf2709c),
      recursion: 1,
      clipBias: 0.003
    })
    
    mirror.rotation.x = Math.PI * -0.5
    mirror.position.set(-1.3, 5, 2)
    this.scene.add(mirror)
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

export { Reflection }
