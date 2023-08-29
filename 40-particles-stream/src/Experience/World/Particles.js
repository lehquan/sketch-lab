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
