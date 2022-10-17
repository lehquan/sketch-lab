import * as THREE from 'three'
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

class Glow {
  constructor() {
    this.clock = new THREE.Clock()
    this.loader = new THREE.TextureLoader()
    this.group = new THREE.Group()
    this.backdrop = null
    this.params = {
      radius: 12,
      detail: 1,
    };
    
    this.init()
    this.light()
    this.addSeed()
    this.addGlow()
    this.addBackground()
  }
  
  init = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    
    // camera
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    this.camera.position.set(0, 0, 50);
    
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0x000000, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    // this.renderer.physicallyCorrectLights = true;
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020C1B)
    
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update()
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  light = () => {
    const ambientLight = new THREE.AmbientLight(0xfae7e7, 0.5)
    this.scene.add(ambientLight)
    
    const directionalLight1 = new THREE.DirectionalLight()
    directionalLight1.intensity = 2.5
    directionalLight1.position.set(10, 10, 5)
    this.scene.add(directionalLight1)
    const directionalLight2 = directionalLight1.clone()
    directionalLight2.intensity = 1
    directionalLight2.position.set(0, 10, 5)
    this.scene.add(directionalLight2)
    
    const pointLight = new THREE.PointLight()
    pointLight.intensity = 1
    pointLight.position.set(0, -10 ,5)
    this.scene.add( pointLight)
  }
  
  addSeed = () => {
    
    // geometry
    const geo = new THREE.IcosahedronGeometry(this.params.radius, this.params.detail)
    const count = geo.attributes.position.count
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const color = new THREE.Color();
    const positions1 = geo.attributes.position;
    const colors1 = geo.attributes.color;
    for (let i = 0; i < count; i++) {
      color.setHSL((positions1.getY(i) / this.params.radius + 1) / 2, 1.0, 0.5);
      colors1.setXYZ(i, color.r, color.g, color.b);
    }
  
    // material 1
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffffff),
      wireframe: true,
    });
    // material 2
    const material = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.2,
      color: new THREE.Color(0x8A51AF),
      wireframe: false,
      flatShading: true,
      roughness: 1,
      vertexColors: false,
    });
    material.onBeforeCompile = function (shader) {
      shader.fragmentShader = shader.fragmentShader.replace(
          "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
          [
            "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
            "gl_FragColor.a *= pow( gl_FragCoord.z, 10.0 );",
          ].join("\n")
      );
    };
  
    const seed = new THREE.Mesh(geo, material);
    let wireframe = new THREE.Mesh(geo, wireframeMaterial);
    seed.add(wireframe);
    
    seed.receiveShadow = true
    seed.scale.setScalar(1)
    seed.rotation.set(0, Math.PI/180 * 5, Math.PI/180 * 38)
    
    this.group.add(seed)
    this.scene.add(this.group)
  }
  
  addGlow = () => {
    this.loader.load('assets/glow.png', texture => {
      const mat = new THREE.SpriteMaterial({
        map: texture,
        // color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.7,
        depthWrite: true,
        side: THREE.DoubleSide
      })
      
      const sprite = new THREE.Sprite(mat)
      sprite.scale.set(40, 40, 1)
      this.group.add(sprite)
    })
  }
  
  addBackground = () => {
    const geo = new THREE.PlaneGeometry(2, 2)
    let mat = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(0x310e68) },
        color2: { value: new THREE.Color(0x090214) },
        ratio: { value: window.innerWidth / window.innerHeight },
      },
      transparent: true,
      vertexShader: `varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position, 1.);
      }`,
      fragmentShader: `varying vec2 vUv;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float ratio;
        void main(){
        	vec2 uv = (vUv - 0.5) * vec2(ratio, 0.5);
          gl_FragColor = vec4( mix( color1, color2, length(uv)), .3 );
        }`,
    })
    
    this.backdrop = new THREE.Mesh(geo, mat)
    this.scene.add(this.backdrop)
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.#render();
  };
  
  #render = () => {
    let t = this.clock.getElapsedTime();
    this.group.position.y = THREE.MathUtils.lerp(this.group.position.y, (-2 + Math.sin(t)) * 2, 0.1)
    this.group.rotation.y = this.group.rotation.z += 0.01
  
    // Move mesh to be flush with camera
    if (this.backdrop) {
      this.backdrop.position.copy(this.camera.position)
      this.backdrop.quaternion.copy(this.camera.quaternion)

      // Apply offset
      this.backdrop.translateZ(-1)
    }
    
    requestAnimationFrame(this.#render)
    this.renderer.render(this.scene, this.camera);
  };
}

export { Glow }
