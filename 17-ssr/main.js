import * as POSTPROCESSING from 'postprocessing';
import { defaultSSROptions, SSREffect } from 'screen-space-reflections';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useBoxProjectedEnvMap } from './addons/BoxProjectedEnvMapHelper';
import { enhanceShaderLighting } from './addons/EnhanceShaderLighting';
import { SSRDebugGUI } from './SSRDebugGUI.js';
import Stats from 'stats.js'
import './style.css';

let ssrEffect;
let emitterMesh;
let gui
let stats
const url = 'room/room.gltf';
let rendererCanvas;
const gltflLoader = new GLTFLoader();

console.log(`THREE.REVISION: ${THREE.REVISION}`)

SSREffect.patchDirectEnvIntensity(0.1);

// scene
const scene = new THREE.Scene();
scene.autoUpdate = false;
scene.add(new THREE.AmbientLight());

// camera
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight, 0.01, 20);
scene.add(camera);

// canvas
const canvas = document.querySelector('.webgl');
rendererCanvas = canvas;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: rendererCanvas,
  powerPreference: 'high-performance',
  premultipliedAlpha: false,
  depth: false,
  stencil: false,
  antialias: false,
  preserveDrawingBuffer: true,
});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// composer
const composer = new POSTPROCESSING.EffectComposer(renderer);
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

gltflLoader.load(url, asset => {
  const room = asset.scene

  room.position.set(-3, -1.3, -3)
  room.rotation.set(0, Math.PI/180 * 180, 0)
  scene.add(room)

  let ceiling;

  room.traverse(c => {
    if (c.material) {
      if (c.name !== 'emissive') {
        const lightMap = c.material.emissiveMap;

        // lightmap
        if (lightMap) {
          c.material.lightMap = lightMap;
          c.material.emissiveMap = null;

          lightMap.encoding = THREE.LinearEncoding;
        }

        c.material.onBeforeCompile = shader => {
          useBoxProjectedEnvMap(shader, envMapPos, envMapSize);
          enhanceShaderLighting(shader, enhanceShaderLightingOptions);
        };
      }

      c.material.color.setScalar(0.05);
      c.material.roughness = 0.2;

      if (c.material.name.includes('ceiling')) {
        c.material.map.offset.setScalar(0);
        c.material.emissive.setHex(0xffb580);
        c.material.roughness = 0.35;

        ceiling = c;
      }

      if (c.material.name.includes('floor')) {
        c.material.normalScale.setScalar(0.4);
      }

      if (c.name.includes('props')) {
        c.material.color.setScalar(0.35);

        if (c.material.name.includes('Couch')) c.material.roughness = 1;
      }

      if (c.material.emissiveMap && c.material.normalMap) {
        c.material.emissiveIntensity = 10;
      }

      c.material.envMapIntensity = Math.PI;
    }

    c.updateMatrixWorld();

    if (c.name === 'emissive') {
      c.material.envMapIntensity = 0;
      emitterMesh = c;
    }
  });

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

  composer.addPass( new POSTPROCESSING.EffectPass(camera, fxaaEffect, ssrEffect, bloomEffect, vignetteEffect) );

  new THREE.TextureLoader().load('OfficeCeiling002_1K_Emission.webp', tex => {
    const emissiveMap = ceiling.material.map.clone();
    emissiveMap.source = tex.source;
    ceiling.material.emissiveMap = emissiveMap;
    ceiling.material.emissiveIntensity = 10;

    scene.environment = ssrEffect.generateBoxProjectedEnvMapFallback(renderer, envMapPos, envMapSize, 1024);
  });

  loop();

  // gui & debug
  gui = new SSRDebugGUI(ssrEffect, params)
  stats = new Stats()
  stats.showPanel(0)
  document.body.appendChild(stats.dom)
});

const loadingEl = document.querySelector('#loading');

let loadedCount = 0;
const loadFiles = 27;
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

const loop = () => {
  if (stats) stats.begin()

  composer.render();

  if (stats) stats.end()
  window.requestAnimationFrame(loop);
};

// event handlers
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  if (ssrEffect) ssrEffect.setSize(window.innerWidth, window.innerHeight);
});
