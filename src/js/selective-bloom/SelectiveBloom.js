import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import {CrystalSparkle} from './CrystalSparkle';
import {Bloom} from './Bloom';

class SelectiveBloom {
  constructor() {
    this.model = null
    this.clock = new THREE.Clock()
    this.loader = new GLTFLoader()
    
    this.init()
    this.light()
    this.build().then()
  }
  
  init = () => {
    const container = document.createElement('div')
    document.body.appendChild(container);
  
    // camera
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        10000,
    );
    this.camera.position.set(0, .8, 3);
  
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(this.renderer.domElement);
  
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000)
  
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update();
  
    // bloom
    this.bloom = new Bloom(this.scene, this.camera, this.renderer)
  
    this.#render();
    window.addEventListener('resize', this.#onWindowResize);
  }
  
  light = () => {
    this.scene.add( new THREE.AmbientLight( 0xffffff ) );
  
    const bottom_1 = new THREE.PointLight( 0xffffff, .5, 300 )
    bottom_1.position.set(0, -20, 250)
    this.scene.add( bottom_1 );
  
    const back = new THREE.PointLight( 0xffffff, .5, 300 )
    back.position.set(-100, -20, -250)
    this.scene.add( back );
  
    const bottom_2 = new THREE.PointLight( 0xFFBF00, 1, 2 )
    bottom_2.power = 100
    bottom_2.position.set(0, -3.5, 0)
    this.scene.add( bottom_2 );
  }
  
  build = async () => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('lib/vendor/draco/gltf/')
    dracoLoader.preload()
    this.loader.setDRACOLoader(dracoLoader)
    await this.loadModel()
    
    this.scene.add(this.model)
    this.sparkle = new CrystalSparkle()
    this.sparkle.sparkle.position.copy(this.model.position)
    this.sparkle.sparkle.position.x = this.model.position.x
    this.sparkle.sparkle.position.z = this.model.position.z
    this.sparkle.sparkle.position.y = this.model.position.y + 3.5
    this.sparkle.start(0)
    this.scene.add(this.sparkle.sparkle)
  }
  
  loadModel = () => {
    return new Promise(resolve => {
      this.loader.load('assets/scifi_girl_v01-v1.glb', gltf => {
        this.model = gltf.scene;
        this.model.position.set(0, -3.6, 0)
        this.model.scale.setScalar(2.5)
        this.model.rotation.y = Math.PI/180 * -90
    
        // Store original color
        this.model.traverse(child => {
          child.frustumCulled = false
          if (child.material) {
            child.userData = {
              color: new THREE.Color().copy(child.material.color),
            };
          }
        })
    
        resolve(this.model)
      });
    })
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.bloom.bloomComposer.setSize(window.innerWidth, window.innerHeight)
    this.bloom.finalComposer.setSize(window.innerWidth,window.innerHeight)
    
    this.#render()
  }
  
  #render = () => {
    // 1. Make all non-bloomed objects totally black
    if (this.model) {
      this.model.traverse(child => {
        if (child.material) {
          child.material.color.set(0x000000)
        }
      })
    }

    // 2. Render the scene with bloomComposer
    this.renderer.setClearColor(0x7B8585)
    this.bloom.bloomComposer.render()

    // 3. Restore materials/colors to previous
    if (this.model) {
      this.model.traverse(child => {
        if (child.material) {
          child.material.color.copy(child.userData.color)
        }
      })
    }

    // 4. Render the scene with finalComposer
    this.renderer.setClearColor(0x7B8585)
    this.bloom.finalComposer.render()

    // if (this.model) this.model.rotation.y += 0.01
    if (this.sparkle) this.sparkle.update(this.clock.getDelta())

    requestAnimationFrame(this.#render)
    // this.renderer.render(this.scene, this.camera) // don't need this if using bloom
  }
}

export { SelectiveBloom }
