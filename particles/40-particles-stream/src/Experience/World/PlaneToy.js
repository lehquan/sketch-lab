import Experience from '../Experience'
import {Mesh, PlaneGeometry, ShaderMaterial} from 'three';
import vertex from '../../shaders/temp.vert'
import fragment from '../../shaders/temp.frag'

export default class PlaneToy {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.setPlaneToy()
  }
  setPlaneToy = () => {
    const geometry = new PlaneGeometry(1, 1, )
    const material = new ShaderMaterial({
      uniforms: {},
      vertexShader: vertex,
      fragmentShader: fragment,
    })
    const plane = new Mesh(geometry, material)
    this.scene.add(plane)
  }
  update = () => {}
}
