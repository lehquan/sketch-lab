import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {SubsurfaceScatteringShader} from 'three/examples/jsm/shaders/SubsurfaceScatteringShader';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';
import { FXAAShader } from 'three/addons/shaders/FXAAShader';
import { BleachBypassShader } from 'three/addons/shaders/BleachBypassShader';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader';
import { ColorCorrectionShader} from 'three/addons/shaders/ColorCorrectionShader';

class Scattering {
  constructor() {
    this.scene = new THREE.Scene();
    this.sssShader = SubsurfaceScatteringShader
    this.gltfLoader = new GLTFLoader()
    this.textureLoader = new THREE.TextureLoader()
    
    this.effectFXAA = null
    this.composer = null
    this.model = null
    this.head = null
    this.eye = null
    
    this.init()
    this.build().then()
  }
  
  init = () => {
    const container = document.createElement("div");
    document.body.appendChild(container)
    // camera
    this.camera = new THREE.PerspectiveCamera(
        20,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    this.camera.position.set(0, 0, 6);
    
    // renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setClearColor( 0x0d1113 );
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene.background = new THREE.Color(0xE5E5E5)
    new RGBELoader().load('assets/future_parking_1k.hdr', texture => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      this.scene.environment = texture
    })
    this.light()
    
    // COMPOSER
    this.createComposer()
    
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update()
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  light = () => {
    this.scene.add( new THREE.AmbientLight( 0x9e9e9e, 1 ) );
    // this.scene.add( new THREE.DirectionalLight( 0x9e9e9e, 1 ) );

    const front = new THREE.PointLight( 0x9e9e9e, 1, 300 )
    front.position.set(0, 1, 5)
    this.scene.add( front );

    const bottom_2 = new THREE.PointLight( 0x9e9e9e, 1, 2 )
    bottom_2.power = 100
    bottom_2.position.set(0, -4, 3)
    this.scene.add( bottom_2 );
  }
  
  build = async () => {
    // load model
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('lib/vendor/draco/gltf/')
    dracoLoader.preload()
    this.gltfLoader.setDRACOLoader(dracoLoader)
    await this.loadModel()
    await this.makeUniform()
  }
  
  /**
   * https://sketchfab.com/3d-models/old-face-caricature-cf4194d4ce404273a62c7711447f5f51
   * https://sketchfab.com/3d-models/angelica-27f75fa94c384000bb6a79a3000f8e80
   * @returns {Promise<unknown>}
   */
  loadModel = () => {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load('assets/angelica-v1.glb', gltf => {
        this.model = gltf.scene
        // const model2 = SkeletonUtils.clone( gltf.scene );
        this.model.scale.setScalar(1/70)
        this.model.position.set(0, -5.5, 0)
        this.scene.add(this.model)
        
        // find object needs to apply SSS
        this.head = this.model.getObjectByName('Head_Head_0')
        this.eye = this.model.getObjectByName('Eye_Eye_0')
        
        resolve(this.model)
      })
    })
  }
  
  makeUniform = () => {
    return new Promise(resolve => {
      // const thicknessTexture = this.textureLoader.load( 'https://threejs.org/examples/models/fbx/bunny_thickness.jpg' );
      
      // head
      const headMap = this.textureLoader.load('assets/texture/angelica/diffuse.jpg')
      headMap.encoding = THREE.sRGBEncoding
      headMap.flipY = false
      const headSpecularMap = this.textureLoader.load('assets/texture/angelica/specular.png')
      headSpecularMap.encoding = THREE.sRGBEncoding
      const headNormalMap = this.textureLoader.load('assets/texture/angelica/normal.jpg')
      headNormalMap.encoding = THREE.sRGBEncoding
      const headAOMap = this.textureLoader.load('assets/texture/angelica/occlusion.png')
      headAOMap.encoding = THREE.sRGBEncoding
      const thicknessTexture = this.textureLoader.load( 'assets/texture/angelica/diffuse.jpg' );
      thicknessTexture.flipY = false
      thicknessTexture.encoding = THREE.sRGBEncoding
      
      // eye
      const eyeMap = this.textureLoader.load('assets/texture/angelica/eye_diffuse.jpg')
      eyeMap.encoding = THREE.sRGBEncoding
      const eyeSpecularMap = this.textureLoader.load('assets/texture/angelica/eye_diffuse.jpg')
      eyeSpecularMap.encoding = THREE.sRGBEncoding
      
      // make uniform
      if (this.head) {
        const faceUniforms = THREE.UniformsUtils.clone(this.sssShader.uniforms)
        faceUniforms.map.value = headMap
        faceUniforms.specularMap.value = headSpecularMap
        faceUniforms.normalMap.value = headNormalMap
        faceUniforms.aoMap.value = headAOMap
        faceUniforms.normalScale.value = new THREE.Vector2(0.8, 0.8);
  
        // faceUniforms[ 'thicknessMap' ].value = thicknessTexture;
        faceUniforms[ 'thicknessColor' ].value = new THREE.Vector3( 0.5, 0.3, 0.0 );
        faceUniforms[ 'thicknessDistortion' ].value = 0.1;
        faceUniforms[ 'thicknessAmbient' ].value = 0.4;
        faceUniforms[ 'thicknessAttenuation' ].value = 0.8;
        faceUniforms[ 'thicknessPower' ].value = 2.0;
        faceUniforms[ 'thicknessScale' ].value = 16.0;
        
        this.convertMat(this.head, faceUniforms, headMap)
      }
      if (this.eye) {
        const eyeUniforms = THREE.UniformsUtils.clone(this.sssShader.uniforms)
        eyeUniforms.map.value = eyeMap
        eyeUniforms.specularMap.value = eyeSpecularMap
        eyeUniforms.normalScale.value = new THREE.Vector2(0.8, 0.8);
        eyeUniforms.uniforms.thicknessScale.value = 1;
        this.convertMat(this.eye, eyeUniforms, eyeMap)
      }
    })
  }
  
  convertMat = (object, uniform, map) => {
    const material = new THREE.ShaderMaterial({
      uniforms: uniform,
      vertexShader: this.sssShader.vertexShader,
      fragmentShader: this.sssShader.fragmentShader,
      lights: true
    })
    material.extensions.derivatives = true
    material.map = map
  
    object.material = material
    object.material.needsUpdate = true
  }
  
  createComposer = () => {
    // this.renderPass = new RenderPass( this.scene, this.camera)
    // this.effectFXAA = new ShaderPass( FXAAShader )
    // this.effectFXAA.uniforms["resolution"].value.set(1/window.innerWidth, 1/window.innerHeight)
    // this.gammaPass = new ShaderPass( GammaCorrectionShader )
    //
    // this.composer = new EffectComposer( this.renderer )
    // this.composer.setSize( window.innerWidth, window.innerHeight );
    // this.composer.setPixelRatio( window.devicePixelRatio );
    // this.composer.addPass( this.renderPass );
    // this.composer.addPass( this.effectFXAA );
    // this.composer.addPass( this.gammaPass );
    
    this.renderer.autoClear = false;
    const renderModel = new RenderPass(this.scene, this.camera)
    const effectBleach = new ShaderPass(BleachBypassShader)
    const effectColor = new ShaderPass(ColorCorrectionShader)
    this.effectFXAA = new ShaderPass(FXAAShader)
    const gammaPass = new ShaderPass(GammaCorrectionShader)
  
    this.effectFXAA.uniforms.resolution.value.set(
        1 / window.innerWidth,
        1 / window.innerHeight
    );
    effectBleach.uniforms.opacity.value = 0.2;
    effectColor.uniforms.powRGB.value.set(1.4, 1.45, 1.45);
    effectColor.uniforms.mulRGB.value.set(1.1, 1.1, 1.1);
    
    this.composer = new EffectComposer( this.renderer )
    this.composer.addPass(renderModel)
    this.composer.addPass(this.effectFXAA)
    this.composer.addPass(effectBleach)
    this.composer.addPass(effectColor)
    this.composer.addPass(gammaPass)
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.composer.setSize(window.innerWidth, window.innerHeight)
    this.composer.setPixelRatio( window.devicePixelRatio );
    this.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / ( width * window.devicePixelRatio ), 1 / ( height * window.devicePixelRatio ) );
    
    this.#render();
  };
  
  #render = () => {

    requestAnimationFrame(this.#render)
    // this.renderer.render(this.scene, this.camera); // don't use this if using composer
    this.composer.render()
  };
}

export { Scattering }
