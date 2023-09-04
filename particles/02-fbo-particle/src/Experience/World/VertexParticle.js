import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/particles.vert'
import fragmentShader from '../../shaders/particles.frag'
export default class VertexParticle {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.params = {
      'Sphere': true,
      'Skull Model': false
    }

    this.setSphere()
    this.setModel()
    this.setParticle()
    this.setDebug()
    this.setFooter()
  }
  setDebug = () => {
    if(!this.debug.active) return

    const debugFolder = this.debug.ui.addFolder('Select Model')
    debugFolder.add(this.params, 'Skull Model').onChange(val => {
      val ? this.point.geometry = this.buffGeometry : this.point.geometry = this.sphereGeometry
    })
  }
  setFooter = () => {
    const footer = document.querySelector('.footer')
    const title = document.createElement('p')
    title.classList.add('title')
    title.innerHTML = 'GPGPU Simulation and Vertex animation. ' +
        '<br>' +
        'This is based on ' +
        '<a href="https://www.youtube.com/watch?v=oLH00MXTqNg&list=PLswdBLT9llbi7arATKwvAaJOAvE_HhWCy&index=10" target="blank">the tutorial of Yuri Artiukh.</a> '
    footer.appendChild(title)

    const info = document.createElement('p')
    info.innerHTML = 'USE DEBUG MODE (#debug) FOR TESTING MATERIAL'
    footer.appendChild(info)

    const link = document.createElement('p')
    link.innerHTML = '3D Model: ' +
        '<a href="https://skfb.ly/6SVEQ" target="blank">Tree Sprite: \'Skull Kid\'</a>'
    footer.appendChild(link)
  }
  setSphere = () => {
    let c1 = new THREE.Color(0x00ffff);
    let c2 = new THREE.Color(0xff00ff);
    let c = new THREE.Color();
    let sphereColors = [];

    this.sphereGeometry = new THREE.IcosahedronGeometry(1, 100)
    for(let i = 0; i < this.sphereGeometry.attributes.position.count; i++){
      c.lerpColors(c1, c2, (1 - this.sphereGeometry.attributes.position.getY(i)) / 2);
      sphereColors.push(c.r, c.g, c.b);
    }
    this.sphereGeometry.setAttribute("color", new THREE.Float32BufferAttribute(sphereColors, 3));
  }
  setModel = () => {
    this.model = this.resources.items.skull.scene
    let modelColors = []
    let c1 = new THREE.Color(0x00ffff);
    let c2 = new THREE.Color(0xff00ff);
    let c = new THREE.Color();
    this.buffGeometry = new THREE.BufferGeometry()

    this.model.traverse(child => {
      if (child.isMesh) {
        child.geometry.rotateY(Math.PI/180 * -90)
        child.geometry.translate(0, 0.2, 0)

        this.buffGeometry = child.geometry
      }
    })

    for(let i = 0; i < this.buffGeometry.attributes.position.count; i++){
      c.lerpColors(c1, c2, (1 - this.buffGeometry.attributes.position.getY(i)) / 2);
      modelColors.push(c.r, c.g, c.b);
    }
    this.buffGeometry.setAttribute("color", new THREE.Float32BufferAttribute(modelColors, 3));
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
    this.point = new THREE.Points(this.sphereGeometry, this.material)
    // this.scene.add(this.point)
  }
  update = (isEnabled) => {
    if (isEnabled) {
      console.log('vertex')
      this.scene.add(this.point)
      this.material.uniforms.time.value = performance.now() / 1000;
    }
    else {
      this.scene.remove(this.point)
    }
  }
}
