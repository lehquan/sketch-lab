import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/sss.vert'
import fragmentShader from '../../shaders/sss.frag'
export default class SSS {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setObject()
  }
  setObject = () => {
    // This indicates where the light is
    this.sphere = new THREE.Mesh(new THREE.SphereGeometry(0.02, 32, 32), new THREE.MeshBasicMaterial())
    this.scene.add(this.sphere)

    this.sssUniforms = {
      uLightPos: { value: new THREE.Vector3() }
    }
    const sssMaterial = new THREE.ShaderMaterial({
      uniforms: this.sssUniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    })

    // object
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
    this.box = new THREE.Mesh(boxGeometry, sssMaterial)
    this.scene.add(this.box)

    // model
    /*this.model = this.resources.items.lantern.scene
    this.model.scale.setScalar(1/50)
    this.model.traverse(child => {
      if (child.material) {
        child.material = sssMaterial
      }
    })
    this.scene.add(this.model)*/
  }
  update = () => {
    const min = -1.0 // 0.5
    const max = +1.0  // 0.7
    const h = Math.sin(performance.now() / 1000) * min + max

    this.sphere.position.y = h;
    this.sssUniforms.uLightPos.value.y = h;

    if(this.box) this.box.rotation.y = performance.now()/1500;
    // if (this.model) this.model.rotation.y = performance.now() /1500
  }
}
