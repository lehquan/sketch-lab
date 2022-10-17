import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader'
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture'

class Snowflake {
  constructor() {
    this.params = {
      radius: 100,
      widthSegment: 64,
      heightSegment: 64
    }
    this.init()
    this.addBall()
  }
  
  init = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    
    // camera
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        .1,
        10000
    );
    this.camera.position.set(0, 0, 350);
    
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xaaaaaa, 0) // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.physicallyCorrectLights = true
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.25
    container.appendChild(this.renderer.domElement)
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x00161e)
    new RGBELoader().load('assets/royal_esplanade_1k.hdr', texture => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      this.scene.environment = texture
    })
  
    const pointLight = new THREE.PointLight(0xffffff, 2)
    pointLight.position.set(400, 400, 400)
    this.scene.add(pointLight)
    
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableZoom = false
    controls.update()
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  addBall = () => {
    const normalMap = new THREE.CanvasTexture( new FlakesTexture())
    normalMap.wrapS = THREE.RepeatWrapping
    normalMap.wrapT = THREE.RepeatWrapping
    normalMap.repeat.x = 10
    normalMap.repeat.y = 6
    normalMap.anisotropy = 16
    
    const mat = new THREE.MeshPhysicalMaterial({
      clearcoat: 1.0,
      metalness: 0.9,
      roughness:0.5,
      color: 0x8418ca,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.15,0.15),
    })
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(this.params.radius, this.params.widthSegment, this.params.heightSegment), mat)
    this.scene.add(this.ball)
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.#render();
  };
  
  #render = () => {
    if (this.ball) {
      this.ball.rotation.x = performance.now() / 2500
      this.ball.rotation.z = performance.now() / 2500
    }
    requestAnimationFrame(this.#render)
    this.renderer.render(this.scene, this.camera);
  };
}

export { Snowflake }
