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
  Vector2,
  Vector4,
} from 'three';

export default class Particles{
  constructor(){
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = 0

    this.addParticles()
  }

  addParticles = () => {
    this.uniforms = {
      uTime: {type: 'f', value: 0.0},
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

    let count = 500;
    const geometry = new BufferGeometry();

    let position = new Float32Array(count*count * 3);
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        let u = Math.random() * 2 * Math.PI;
        let v = Math.random() * Math.PI;

        let x = (0.9 + 0.2*v) * Math.cos(u)*Math.sin(v);
        let y = 1.5 * Math.cos(v);
        let z = (0.9 + 0.2*v) * Math.sin(u)*Math.sin(v);

        position.set([
          (i/count - 0.5) * 10,
          (j/count - 0.5) * 10,
            0
        ], 3*(i * count + j))
        // position.set([x, y, z], 3*(i * count + j))
      }
    }
    geometry.setAttribute('position', new BufferAttribute(position, 3));

    const plane = new Points(geometry, material);
    this.scene.add(plane);
  };
  update = () => {
    this.time += 0.05
    this.uniforms.uTime.value = this.time;
  }
}
