import * as THREE from "three"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader'
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader'
import { OBJLoader } from 'three/addons/loaders/OBJLoader'
import { RGBELoader } from 'three/addons/loaders/RGBELoader'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module'
import Experience from '../Experience/Experience';
import EventEmitter from "./EventEmitter.js"

export default class Resources extends EventEmitter {
  constructor(sources) {
    super()

    this.experience = new Experience()
    this.renderer = this.experience.renderer.instance
    this.sources = sources

    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    this.setLoaders()
    this.startLoading()
  }

  /**
   * Setting GLTFLoader, DRACOLoader and KTX2Loader
   * MUST be in order.
   */
  setLoaders() {
    this.loaders = {}

    // gltf
    this.loaders.gltfLoader = new GLTFLoader()
    // this.loaders.gltfLoader.setMeshoptDecoder(MeshoptDecoder)

    // draco
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath( '/vendor/draco/' )
    dracoLoader.preload()
    this.loaders.gltfLoader.setDRACOLoader( dracoLoader )

    // ktx2 for meshopt
    // const ktx2Loader = new KTX2Loader()
    // ktx2Loader.setTranscoderPath('/vendor/basis/')
    // ktx2Loader.detectSupport(this.renderer)
    // this.loaders.gltfLoader.setKTX2Loader(ktx2Loader)

    // another loaders
    this.loaders.objLoader = new OBJLoader()
    this.loaders.textureLoader = new THREE.TextureLoader()
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
    this.loaders.hdrLoader = new RGBELoader()
  }

  startLoading() {
    /**load each source */
    for (const source of this.sources) {
      if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
      else if (source.type === "objModel") {
        this.loaders.objLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
      else if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
      else if (source.type === "hdrTexture") {
        this.loaders.hdrLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
      else if (source.type === "cubeTexture") {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;

    this.loaded++;

    /**Trigger Event Emitter if all sources are loaded */
    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }
}
