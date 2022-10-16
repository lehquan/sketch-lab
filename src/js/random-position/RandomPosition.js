import * as THREE from 'three'
import { OrbitControls} from 'three/addons/controls/OrbitControls';

class RandomPosition {
  constructor() {
    this.particle = []
    this.count = 200
    this.group = new THREE.Group()
    this.clock = new THREE.Clock()
  }
  
  init = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    
    // camera
    this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    this.camera.position.set(0, 0, 20);
    
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0x202020, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x202020)
    
    // lights
    const pointL = new THREE.PointLight()
    pointL.intensity = 1.5
    const ambientL = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientL, pointL)
    
    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update()
    
    this.#addObject()
    
    this.#render()
    window.addEventListener("resize", this.#onWindowResize);
  };
  
  #addObject = () => {
    const geo = new THREE.SphereGeometry(1, 64, 64)
    const sphere = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0xFFFF00}))
    this.group.add(sphere)
  
    for(let i=0; i< this.count; i++){
      let s = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({color: Math.random() * 0x7f7f7f + 0x7f7f7f}));
      s.scale.setScalar(THREE.MathUtils.randFloat(0.1, 0.25));
      s.userData = {
        posY: THREE.MathUtils.randFloat(-10, 10),			// at what height
        radius: THREE.MathUtils.randFloat(5, 10),			// how far from Y-axis
        phase: Math.random() * Math.PI * 2,						// where to start
        speed: (0.1 - Math.random() * 0.2) * Math.PI	// how fast to circulate
      };
      this.particle.push(s);
      this.group.add(s)
    }
    
    this.scene.add(this.group)
  }
  
  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.#render();
  };
  
  #render = () => {
    let t = this.clock.getElapsedTime()
    this.particle.forEach(sphere => {
      let ud = sphere.userData;
      let a = (ud.speed * t) + ud.phase;
      sphere.position.set(Math.cos(a), 0, -Math.sin(a))
      .multiplyScalar(ud.radius)
      .setY(ud.posY);
    })
    this.group.rotation.y += 0.001
    
    requestAnimationFrame(this.#render)
    this.renderer.render(this.scene, this.camera);
  };
}

export { RandomPosition }
