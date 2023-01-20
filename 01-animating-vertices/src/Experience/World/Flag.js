import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'
import Experience from '../Experience'
import { gsap } from 'gsap'

export default class Flag {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.perlin = new ImprovedNoise()
    this.clock = new THREE.Clock()
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.counter = 0
    this.weight = [0.2126, 0.7152, 0.0722]
    this.zRange = 120
    this.textures = []
    this.inks = []

    // debug
    this.effect = { 'Transition Speed': 0.25 }

    this.setTextures()
    this.setMap()

    window.addEventListener('mousemove', this.onMouseMove)
  }
  setTextures = () => {
    this.textures.push(
        this.resources.items.town_1,
        this.resources.items.town_2,
        this.resources.items.town_3,
        this.resources.items.town_4,
        this.resources.items.town_5,
        this.resources.items.town_6,
        this.resources.items.town_7,
        this.resources.items.town_8,
    )
    /*this.inks.push(
        this.resources.items.disp_1,
        this.resources.items.disp_2,
        this.resources.items.disp_3,
        this.resources.items.disp_4,
        this.resources.items.disp_5,
    )*/
  }
  setMap = () => {
    const geometry = new THREE.PlaneGeometry(40, 18, 32, 32)
    geometry.rotateX(Math.PI * 0.5)
    geometry.center()

    /*const material = new THREE.MeshBasicMaterial({
      map: this.resources.items.town_0,
      side: THREE.DoubleSide,
      transparent: true,
    })*/

    // Case 1
    /*let material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: false,
      uniforms: {
        t1: {value: this.textures[0]},
        t2: {value: this.textures[1]},
        transition: {value: 0}
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D t1;
        uniform sampler2D t2;
        uniform float transition;
        varying vec2 vUv;
        void main(){
          vec4 tex1 = texture2D(t1, vUv);
          vec4 tex2 = texture2D(t2, vUv);

          gl_FragColor = mix(tex1, tex2, transition);
        }
      `
    });*/

    // Case 2
    let index = Math.floor(Math.random() * 7 + 1)
    let material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        dispFactor: {
          type: 'f',
          value: 0.0
        },
        uSpeed: {
          type: 'f',
          value: this.effect['Transition Speed']
        },
        tex1: { value: this.textures[index]},
        tex2: { value: this.textures[index+1]},
        disp: { value: this.resources.items.disp_4},
      },
      vertexShader: `
        varying vec2 vUv; 

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv; 

        uniform float dispFactor; 

        uniform sampler2D disp; 
        uniform sampler2D tex1; 
        uniform sampler2D tex2;
        uniform float uSpeed;

        void main() {
          vec2 uv = vUv;

          vec4 disp = texture2D(disp, uv);

          float r = dispFactor * (1.0 + 0.25 * 2.0) - 0.25;
          // float mixit = clamp((disp.r - r) * (1.0 / 0.05), 0.0, 1.0);
          float mixit = clamp((disp.r - r) * (1.0 / uSpeed), 0.0, 1.0);

          vec4 _tex1 = texture2D(tex1, uv);
          vec4 _tex2 = texture2D(tex2, uv);

          if (_tex1.a < 0.5) discard;
          if (_tex2.a < 0.5) discard;

          gl_FragColor = mix(_tex2, _tex1, mixit);
        }
      `
    })

    this.flag = new THREE.Mesh(geometry, material)
    this.flag.rotation.x = Math.PI/180 * -120
    this.flag.position.y = 2
    this.scene.add(this.flag)

    this.position = geometry.attributes.position
    this.uv = geometry.attributes.uv
    this.vUv = new THREE.Vector2()

    // this.startSequence(material)

    // debug
    if (this.debug.active) {
      this.debug.ui.add(this.effect, 'Transition Speed', 0.01, 0.5).step(0.01).onChange(val => {
        this.flag.material.uniforms.uSpeed.value = val
        this.flag.material.uniforms.needsUpdate = true
      })
    }
  }
  startSequence = (m) => {
    gsap.fromTo(m.uniforms.transition,
        {value: 0},
        {value: 1,
          duration: 2,
          repeat: -1,
          repeatRefresh: false,
          ease: "circ.out",
          onRepeat: () => {
            let idx1 = this.counter % this.textures.length;
            let idx2 = (idx1 + 1) === this.textures.length ? 0 : idx1 + 1;
            this.counter++;
            m.uniforms.t1.value = this.textures[idx1];
            m.uniforms.t2.value = this.textures[idx2];
            m.uniforms.needsUpdate = true
          }
        })
  }
  onMouseMove = (e) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

    this.onHandler()
  }
  onHandler = () => {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects([this.flag])

    /*if (intersects.length > 0) {
      let idx1 = this.counter % this.textures.length
      let idx2 = (idx1 + 1) === this.textures.length ? 0 : idx1 + 1
      this.counter ++
      console.log(idx1, idx2)

      // this.flag.material.uniforms.tex1.value = this.textures[idx1]
      // this.flag.material.uniforms.tex2.value = this.textures[idx2]
      // this.flag.material.uniforms.needsUpdate = true
    }*/
    gsap.to(this.flag.material.uniforms.dispFactor, {
      duration: 2.5,
      value: intersects.length,
      ease: "power2.out",
      onComplete: () => {

      }
    })
  }
  update = () => {
    let t = this.clock.getElapsedTime()
    for(let i=0; i<this.position.count; i++) {
      this.vUv.fromBufferAttribute(this.uv, i).multiplyScalar(2.5)
      const y = this.perlin.noise(this.vUv.x, this.vUv.y + t,  t * 0.1)
      this.position.setY(i, y)
    }
    this.position.needsUpdate = true
  }
}
