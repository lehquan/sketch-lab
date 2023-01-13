import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import EventEmitter from "./EventEmitter.js"
import { SOURCE_TYPE } from './contains'

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    this.sources = sources;

    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {}

    this.audioLoader = new THREE.AudioLoader()
    this.loaders.objLoader = new OBJLoader()
    this.loaders.textureLoader = new THREE.TextureLoader()
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()

    this.loaders.gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath( '/vendor/draco/' )
    this.loaders.gltfLoader.setDRACOLoader( dracoLoader )
  }

  startLoading() {
    /**load each source */
    for (const source of this.sources) {
      if (source.type === SOURCE_TYPE.GLTF_MODEL) {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      }
      else if (source.type === SOURCE_TYPE.OBJ_MODEL) {
        this.loaders.objLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      }
      else if (source.type === SOURCE_TYPE.TEXTURE) {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      }
      else if (source.type === SOURCE_TYPE.CUBE_TEXTURE) {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      }
      else if (source.type === SOURCE_TYPE.AUDIO) {
        // for both Positional and Non-Positional Audio
        this.audioLoader.load(source.path, buffer => {
          this.sourceLoaded(source, buffer)
        })
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file

    this.loaded++

    /**Trigger Event Emitter if all sources are loaded */
    if (this.loaded === this.toLoad) {
      this.trigger("ready")
    }
  }
}
