import * as THREE from 'three'
import { TWEEN } from 'three/addons/libs/tween.module.min';
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import {SubsurfaceScatteringShader} from 'three/examples/jsm/shaders/SubsurfaceScatteringShader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass'
import { FXAAShader } from 'three/addons/shaders/FXAAShader'
import { BleachBypassShader } from 'three/addons/shaders/BleachBypassShader'
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader'
import { ColorCorrectionShader} from 'three/addons/shaders/ColorCorrectionShader'

class Scattering {
  constructor() {
    this.sssShader = SubsurfaceScatteringShader
    this.gltfLoader = new GLTFLoader()
    this.textureLoader = new THREE.TextureLoader()
    this.radius = 200
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
    this.camera.position.set(0, 0, 8);
    
    // renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    // this.renderer.logarithmicDepthBuffer = true
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.VSMShadowMap
    this.renderer.autoClear = false
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xE5E5E5)
    new RGBELoader().load('assets/future_parking_1k.hdr', texture => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      this.scene.environment = texture
    })
    
    // light
    this.scene.add( new THREE.AmbientLight( 0x9e9e9e, 1 ) );
    const front = new THREE.PointLight( 0x9e9e9e, 1, 300 )
    front.position.set(0, 1, 5)
    this.scene.add( front );
    
    this.spotLightMesh = new THREE.Mesh( new THREE.SphereGeometry( 1/10, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x888888, transparent: true, opacity: 0 } ) );
    this.spotLight = new THREE.SpotLight()
    this.spotLight.castShadow = true
    this.spotLight.shadow.mapSize.width = 512
    this.spotLight.shadow.mapSize.height = 512
    this.spotLight.shadow.camera.near = 0.5
    this.spotLight.shadow.camera.far = 100
    this.spotLightMesh.add(this.spotLight);
    this.spotLightMesh.position.set(0, 3, 0)
    this.scene.add( this.spotLightMesh );
  
    /*this.spotLight1 = this.createSpotlight( 0xFF7F00 );
    this.spotLight2 = this.createSpotlight( 0x00FF7F );
    this.spotLight3 = this.createSpotlight( 0x7F00FF );
    this.spotLight1.position.set( 5, 25, 35 );
    this.spotLight2.position.set( 0, 25, 35 );
    this.spotLight3.position.set( -5, 25, 35 );
    this.scene.add( this.spotLight1, this.spotLight2, this.spotLight3 );*/
    
    // COMPOSER
    this.initComposer()
    
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.maxDistance = 10
    controls.minDistance = 5
    controls.update()
    
    this.#render()
    // this.animateSpotLight()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  build = async () => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('lib/vendor/draco/gltf/')
    dracoLoader.preload()
    this.gltfLoader.setDRACOLoader(dracoLoader)
    await this.loadModel()
    await this.makeUniform()
  }
  
  createSpotlight = ( color ) => {
    
    const newObj = new THREE.SpotLight( color, 2 );
    
    newObj.castShadow = true;
    newObj.angle = 0.3;
    newObj.penumbra = 0.2;
    newObj.decay = 2;
    newObj.distance = 50;
    
    return newObj;
    
  }
  
  tween = ( light ) => {
    new TWEEN.Tween( light ).to( {
      angle: ( Math.random() * 0.7 ) + 0.1,
      penumbra: Math.random() + 1
    }, Math.random() * 3000 + 2000 )
    .easing( TWEEN.Easing.Quadratic.Out ).start();
    
    new TWEEN.Tween( light.position ).to( {
      x: ( Math.random() * 30 ) - 15,
      y: ( Math.random() * 10 ) + 15,
      z: ( Math.random() * 30 ) - 15
    }, Math.random() * 3000 + 2000 )
    .easing( TWEEN.Easing.Quadratic.Out ).start();
    
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
        
        this.model.traverse(child => {
          child.receiveShadow = true
          child.castShadow = true
        })
        
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
      const headMap = this.textureLoader.load('assets/texture/diffuse.jpg')
      headMap.encoding = THREE.sRGBEncoding
      headMap.flipY = false
      const headSpecularMap = this.textureLoader.load('assets/texture/specular.png')
      headSpecularMap.encoding = THREE.sRGBEncoding
      const headNormalMap = this.textureLoader.load('assets/texture/normal.jpg')
      headNormalMap.encoding = THREE.sRGBEncoding
      const headAOMap = this.textureLoader.load('assets/texture/occlusion.png')
      headAOMap.encoding = THREE.sRGBEncoding
      const thicknessTexture = this.textureLoader.load( 'assets/texture/diffuse.jpg' );
      thicknessTexture.flipY = false
      thicknessTexture.encoding = THREE.sRGBEncoding
      
      // eye
      const eyeMap = this.textureLoader.load('assets/texture/eye_diffuse.jpg')
      eyeMap.encoding = THREE.sRGBEncoding
      const eyeSpecularMap = this.textureLoader.load('assets/texture/eye_diffuse.jpg')
      eyeSpecularMap.encoding = THREE.sRGBEncoding
      
      // make uniform
      if (this.head) {
        const faceUniforms = THREE.UniformsUtils.clone(this.sssShader.uniforms)
        faceUniforms.map.value = headMap
        faceUniforms.specularMap.value = headSpecularMap
        faceUniforms.normalMap.value = headNormalMap
        faceUniforms.aoMap.value = headAOMap
        // faceUniforms.normalScale.value = new THREE.Vector2(0.8, 0.8);
  
        // faceUniforms[ 'thicknessMap' ].value = thicknessTexture;
        // faceUniforms.thicknessColor.value = new THREE.Vector3( 0.5, 0.3, 0.0 );
        // faceUniforms.thicknessDistortion.value = 0.1;
        // faceUniforms.thicknessAmbient.value = 0.4;
        // faceUniforms.thicknessAttenuation.value = 0.8;
        // faceUniforms.thicknessPower.value = 2.0;
        // faceUniforms.thicknessScale.value = 1.0;
        
        this.convertMat(this.head, faceUniforms, headMap)
      }
      if (this.eye) {
        const eyeUniforms = THREE.UniformsUtils.clone(this.sssShader.uniforms)
        eyeUniforms.map.value = eyeMap
        eyeUniforms.specularMap.value = eyeSpecularMap
        // eyeUniforms.normalScale.value = new THREE.Vector2(0.8, 0.8);
        // eyeUniforms.thicknessScale.value = 1;
        // eyeUniforms.thicknessColor.value = new THREE.Vector3( 0.5, 0.3, 0.0 );
        // eyeUniforms.thicknessDistortion.value = 0.1;
        // eyeUniforms.thicknessAmbient.value = 0.4;
        // eyeUniforms.thicknessAttenuation.value = 0.8;
        // eyeUniforms.thicknessPower.value = 2.0;
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
  
  initComposer = () => {
    /*this.renderPass = new RenderPass( this.scene, this.camera)
    this.effectFXAA = new ShaderPass( FXAAShader )
    this.effectFXAA.uniforms["resolution"].value.set(1/window.innerWidth, 1/window.innerHeight)
    this.gammaPass = new ShaderPass( GammaCorrectionShader )

    this.composer = new EffectComposer( this.renderer )
    this.composer.setSize( window.innerWidth, window.innerHeight );
    this.composer.setPixelRatio( window.devicePixelRatio );
    this.composer.addPass( this.renderPass );
    this.composer.addPass( this.effectFXAA );
    this.composer.addPass( this.gammaPass );*/
    
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
    // this.composer.addPass(this.effectFXAA)
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
    this.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / ( window.innerWidth * window.devicePixelRatio ), 1 / ( window.innerWidth * window.devicePixelRatio ) );
    
    this.#render();
  };
  
  animateSpotLight = () => {
    this.tween( this.spotLight1 );
    this.tween( this.spotLight2 );
    this.tween( this.spotLight3 );
    setTimeout( this.animateSpotLight, 5000 );
  }
  
  #render = () => {
    let t = performance.now() / 2000
    // TWEEN.update();
    
    if (this.spotLightMesh) {
      this.spotLightMesh.position.set(Math.cos(t), 0, -Math.sin(t)).multiplyScalar(this.radius);
    }
    
    requestAnimationFrame(this.#render)
    // this.renderer.render(this.scene, this.camera); // don't use this if using composer
    this.composer.render(0.01)
  };
}

export { Scattering }
