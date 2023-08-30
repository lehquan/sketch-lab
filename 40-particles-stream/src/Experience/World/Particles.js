import Experience from '../Experience'
import vertex from '../../shaders/particles.vert'
import fragment from '../../shaders/particles.frag'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Points,
  ShaderMaterial,
} from 'three';

export default class Particles{
  constructor(){
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.time = 0

    this.params = {
      count: 700,
      size: 6,
      speed: 0.4
    }

    this.addParticles()
    this.setDebug()
    this.setFooter()
  }
  setDebug = () => {
    if (!this.debug.active) return

    this.debug.ui.add(this.params, 'size', 4.0, 10.0).onChange(val => {
      this.uniforms.uSize.value = val
    })
    this.debug.ui.add(this.params, 'speed', 0.4, 4.0).onChange(val => {
      this.uniforms.uSpeed.value = val
    })
  }
  setFooter = () => {
    const footer = document.getElementById('footer')

    const infoWrapper = document.createElement('div')
    infoWrapper.classList.add('info')
    footer.appendChild(infoWrapper)

    // title
    const title = document.createElement('h1')
    title.innerHTML = 'Curtain'
    infoWrapper.appendChild(title)

    // description
    const description = document.createElement('p')
    description.innerHTML = 'Applying Classic Perlin 3D Noise for Particles to achieve a waving curtain effect.' +
            '<br>' +
            'Thanks to ' +
            '<a href="https://www.youtube.com/live/i-uesNLuunw?si=a70EWcgOdfTqdJx-" target="blank">the tutorial of Yuri Artiukh.</a> '
    infoWrapper.appendChild(description)

    const hint = document.createElement('p')
    hint.classList.add('hint')
    hint.innerHTML = 'USE DEBUG MODE (#debug) FOR TESTING'
    infoWrapper.appendChild(hint)

    // const link = document.createElement('p')
    // link.innerHTML = 'Image Credit: ' +
    //     '<a href="https://shiftbrain.com/work/misatoto/?lang=en" target="blank">Misato Town</a>'
    // footer.appendChild(link)
  }
  addParticles = () => {
    this.uniforms = {
      uTime: {type: 'f', value: 0.0},
      uSize: {type: 'f', value: this.params.size},
      uSpeed: {type: 'f', value: this.params.speed},
    }
    const material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      side: DoubleSide,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending
    });

    const geometry = new BufferGeometry();
    let position = new Float32Array(this.params.count*this.params.count * 3);
    for (let i = 0; i < this.params.count; i++) {
      for (let j = 0; j < this.params.count; j++) {
        position.set([
          (i/this.params.count - 0.5) * 12,
          (j/this.params.count - 0.5) * 12,
            0
        ], 3*(i * this.params.count + j))

        // let u = Math.random() * 2 * Math.PI;
        // let v = Math.random() * Math.PI;
        // let x = (0.9 + 0.2*v) * Math.cos(u)*Math.sin(v);
        // let y = 1.5 * Math.cos(v);
        // let z = (0.9 + 0.2*v) * Math.sin(u)*Math.sin(v);
        // position.set([x, y, z], 3*(i * this.params.count + j))
      }
    }
    geometry.setAttribute('position', new BufferAttribute(position, 3));
    const plane = new Points(geometry, material);
    this.scene.add(plane);
  };
  update = () => {
    this.time += 0.05
    this.uniforms.uTime.value = performance.now() / 800
  }
}
