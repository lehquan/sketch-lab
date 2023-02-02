import * as POSTPROCESSING from 'postprocessing';
import { defaultSSROptions, SSREffect } from 'screen-space-reflections';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useBoxProjectedEnvMap } from './addons/BoxProjectedEnvMapHelper';
import { enhanceShaderLighting } from './addons/EnhanceShaderLighting';
import { SSRDebugGUI } from './SSRDebugGUI.js';
import Stats from 'stats.js'
import './style.css';

console.log(`THREE.REVISION: ${THREE.REVISION}`)

let loadedCount = 0;
const loadFiles = 23;
let camera, scene, renderer;
let rendererCanvas;
let mesh;
let ssrEffect, composer;
const gltflLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( './addons/draco/' );
gltflLoader.setDRACOLoader( dracoLoader );

//******************************************************************************
init();
animate();

function init() {

  // scene
  scene = new THREE.Scene();
  scene.matrixAutoUpdate = false;
  scene.add(new THREE.AmbientLight());

  // camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 10000 );
  camera.position.z = 250;

  // canvas
  const canvas = document.querySelector('.webgl');
  rendererCanvas = canvas

  // renderer
  renderer = new THREE.WebGLRenderer( {
    canvas: rendererCanvas,
    powerPreference: 'high-performance',
    premultipliedAlpha: false,
    antialias: false,
    stencil: false,
    depth: false,
    preserveDrawingBuffer: true,
  } );
  renderer.setClearColor(0x000000, 1)
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.autoClear = true
  renderer.setSize( window.innerWidth, window.innerHeight );

  /*const container = document.getElementById( 'container' );
  renderer = new THREE.WebGLRenderer( {
    antialias: true,
  } );
  renderer.setClearColor(0x000000, 1)
  renderer.autoClear = true
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild( renderer.domElement );*/

  // controls
  const controls = new OrbitControls( camera, renderer.domElement );
  controls.update();

  // composer
  composer = new POSTPROCESSING.EffectComposer(renderer);
  const renderPass = new POSTPROCESSING.RenderPass(scene, camera);
  composer.addPass(renderPass);
  const params = {
    ...defaultSSROptions,
    ...{
      enabled: true,
      resolutionScale: 1,
      velocityResolutionScale: 1,
      correctionRadius: 2,
      blend: 0.95,
      correction: 0.1,
      blur: 0,
      blurSharpness: 10,
      blurKernel: 1,
      distance: 10,
      intensity: 1,
      exponent: 1.75,
      maxRoughness: 0.99,
      jitter: 0,
      jitterRoughness: 2,
      roughnessFade: 1,
      fade: 1.03,
      thickness: 3.5,
      ior: 1.75,
      steps: 5,
      refineSteps: 6,
      maxDepthDifference: 50,
      missedRays: false,
    },
  };

  const settings = {
    envMapPosX: 0,
    envMapPosY: 1,
    envMapPosZ: 0,
    envMapSizeX: 12,
    envMapSizeY: 3.90714,
    envMapSizeZ: 8.5,
    aoPower: 2,
    aoSmoothing: 0.43,
    aoMapGamma: 0.74,
    lightMapGamma: 1.21,
    lightMapSaturation: 1.09,
    envPower: 3.6,
    smoothingPower: 0.41000000000000003,
    roughnessPower: 1,
    sunIntensity: 0,
    aoColor: 13744018,
    aoColorSaturation: 0.4064516129032258,
    hemisphereColor: 2301734,
    irradianceColor: 9011574,
    radianceColor: 12222327,
    sunColor: 16777215,
    mapContrast: 0.77,
    lightMapContrast: 1.1500000000000001,
    irradianceIntensity: 0.44,
    radianceIntensity: 6.34,
  };
  const envMapPos = new THREE.Vector3(settings.envMapPosX, settings.envMapPosY, settings.envMapPosZ);
  const envMapSize = new THREE.Vector3(settings.envMapSizeX, settings.envMapSizeY, settings.envMapSizeZ);
  const enhanceShaderLightingOptions = {
    ...settings,
    ...{
      aoColor: new THREE.Color(settings.aoColor),
      hemisphereColor: new THREE.Color(settings.hemisphereColor),
      irradianceColor: new THREE.Color(settings.irradianceColor),
      radianceColor: new THREE.Color(settings.radianceColor),
    },
  };

  // cube
  const geometry = new THREE.BoxGeometry( 100, 100, 100 );
  const material = new THREE.MeshBasicMaterial( { color: 'red' } );
  mesh = new THREE.Mesh( geometry, material );
  // scene.add( mesh );

  gltflLoader.load( 'assets_0802-v1.glb', asset => {
    const room = asset.scene
    room.scale.setScalar(15)
    room.position.set(0, -100, 0)
    scene.add(room)

    let rightColumn = room.getObjectByName('pillar_left').clone()
    rightColumn.position.x *= -1
    room.add(rightColumn)

    let ceiling;
    let floor, center;

    // setup material
    room.traverse(child => {
      if (child.material) {
        // child.material.onBeforeCompile = shader => {
        //   enhanceShaderLighting(shader, enhanceShaderLightingOptions)
        // }

        // child.material.color.setScalar(0.05)
        child.material.roughness = 0.2

        // ceiling
        if(child.material.name.includes('light2')) {
          child.material.map.offset.setScalar(0);
          // child.material.emissive = new THREE.Color(0xffb580)
          child.material.roughness = 0.35;

          ceiling = child;
        }

        // floor
        if (child.name === 'floor') {
          child.material.normalScale.setScalar(0.4);
          floor = child
        }

        // center
        if (child.name === 'center') {
          child.material.normalScale.setScalar(0.4);
          center = child
        }

        if (child.material.emissiveMap && child.material.normalMap) {
          child.material.emissiveIntensity = 10;
        }

        child.material.envMapIntensity = Math.PI;
      }

      child.updateMatrixWorld()
    })

    // now init SSR effect
    ssrEffect = new SSREffect(scene, camera, params);
    const bloomEffect = new POSTPROCESSING.BloomEffect({
      intensity: 2,
      luminanceThreshold: 0.4,
      luminanceSmoothing: 0.7,
      kernelSize: POSTPROCESSING.KernelSize.HUGE,
      mipmapBlur: true,
    });
    const vignetteEffect = new POSTPROCESSING.VignetteEffect({
      darkness: 0.3675,
    });
    const fxaaEffect = new POSTPROCESSING.FXAAEffect();
    composer.addPass( new POSTPROCESSING.EffectPass(camera, fxaaEffect, bloomEffect, vignetteEffect) );

    new THREE.TextureLoader().load('floor-roughness.jpg', tex => {
      floor.material.roughnessMap = tex
      floor.material.roughness = 1
      center.material.roughnessMap = tex

      scene.environment = ssrEffect.generateBoxProjectedEnvMapFallback(renderer, envMapPos, envMapSize, 1024);
    });
  })

  //
  window.addEventListener( 'resize', onWindowResize );

  //
  const loadingEl = document.querySelector('#loading');
  THREE.DefaultLoadingManager.onProgress = () => {
    loadedCount++;

    if (loadedCount === loadFiles) {
      setTimeout(() => {
        if (loadingEl) loadingEl.remove();
      }, 150);
    }

    const progress = Math.round((loadedCount / loadFiles) * 100);
    if (loadingEl) loadingEl.textContent = progress + '%';
  };
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  if (ssrEffect) ssrEffect.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame( animate );

  // renderer.render( scene, camera );
  renderer.setClearColor(0x000000, 1)
  composer.render();

}
