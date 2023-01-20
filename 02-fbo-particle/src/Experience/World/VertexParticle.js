import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/particles.vert'
import fragmentShader from '../../shaders/particles.frag'
export default class VertexParticle {
  constructor(_debugFolder) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debugFolder = _debugFolder

    this.setModel()
    this.setParticle()
  }
  setModel = () => {
    this.model = this.resources.items.skull.scene
    this.facePos = []
    this.model.traverse(child => {
      if (child.isMesh) {
        child.geometry.rotateY(Math.PI/180 * -90)
        child.geometry.translate(0, 0.2, 0)
        this.facePos.push(...child.geometry.attributes.position.array)
      }
    })

    this.faceNumber = this.facePos.length / 3
  }
  setParticle = () => {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0},
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
    })

    let c1 = new THREE.Color(0x00ffff);
    let c2 = new THREE.Color(0xff00ff);
    let c = new THREE.Color();
    let sphereColors = [];
    let modelColors = [];

    // Apply particle geometry to model (if using model)
    this.buffGeometry = new THREE.BufferGeometry()
    this.model.traverse(child => {
      if (child.isMesh) {
        this.buffGeometry = child.geometry
      }
    })
    for(let i = 0; i < this.buffGeometry.attributes.position.count; i++){
      c.lerpColors(c1, c2, (1 - this.buffGeometry.attributes.position.getY(i)) / 2);
      modelColors.push(c.r, c.g, c.b);
    }
    this.buffGeometry.setAttribute("color", new THREE.Float32BufferAttribute(modelColors, 3));

    // if using premitive sphere
    this.sphereGeometry = new THREE.IcosahedronGeometry(1, 100)
    for(let i = 0; i < this.sphereGeometry.attributes.position.count; i++){
      c.lerpColors(c1, c2, (1 - this.sphereGeometry.attributes.position.getY(i)) / 2);
      sphereColors.push(c.r, c.g, c.b);
    }
    this.sphereGeometry.setAttribute("color", new THREE.Float32BufferAttribute(sphereColors, 3));

    // particle
    this.particle = new THREE.Points(this.sphereGeometry, this.material)

    // debug
    if (this.debugFolder) {
      const debugObject = {
        'Skull Model': false,
      }
      this.debugFolder.add(debugObject, 'Skull Model').onChange(val => {
        val ? this.particle.geometry = this.buffGeometry : this.particle.geometry = this.sphereGeometry
      })
    }
  }
  update = (isEnabled) => {
    if (isEnabled) {
      this.scene.add(this.particle)
      this.material.uniforms.time.value = performance.now() / 1000;
    }
    else {
      this.scene.remove(this.particle)
    }
  }
}
