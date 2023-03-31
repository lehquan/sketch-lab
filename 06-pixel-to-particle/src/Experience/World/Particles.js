import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/particle.vert'
import fragmentShader from '../../shaders/particle.frag'

export default class Particles {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    this.weight = [0.2126, 0.7152, 0.0722]
    this.zRange = 120
    this.isAnimated = true

    this.setEnv()
    this.createImageData()
    this.setParticle()
    this.setFooter()
  }
  setEnv = () => {
    this.camera.position.set(0, 0, 500)
  }
  setFooter = () => {
    const footer = document.getElementById('footer')

    const title = document.createElement('p')
    title.classList.add('title')
    title.innerHTML = 'From pixels to particles.'
    footer.appendChild(title)

    const info = document.createElement('p')
    info.innerHTML = 'USE DEBUG MODE (#debug) FOR TESTING'
    footer.appendChild(info)

    const link = document.createElement('p')
    link.innerHTML = 'Models: ' +
        '<a href="#" target="blank">Sketchfab</a> '
    // footer.appendChild(link)
  }
  createImageData = () => {
    const image = this.resources.items.flower.source.data

    this.imageWidth = this.resources.items.flower.source.data.width
    this.imageHeight = this.resources.items.flower.source.data.height

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = this.imageWidth
    canvas.height = this.imageHeight

    context.fillStyle = context.createPattern(image, 'no-repeat')
    context.fillRect(0, 0, this.imageWidth, this.imageHeight)

    this.imageData = context.getImageData(0, 0, this.imageWidth, this.imageHeight).data
  }
  setParticle = () => {
    let c = 0

    const geometry = new THREE.BufferGeometry()
    const vertices = []
    const colors = []

    let x = this.imageWidth * -0.5
    let y = this.imageHeight * 0.5

    for(let i = 0; i < this.imageHeight; i++) {
      for (let j=0; j< this.imageWidth; j++) {
        let color = new THREE.Color()
        color.setRGB(this.imageData[c] / 255, this.imageData[c+1] / 255, this.imageData[c+2] / 255)
        colors.push(color.r, color.g, color.b)

        const weight = color.r * this.weight[0] + color.g * this.weight[1] + color.b * this.weight[2]
        vertices.push(x, y, (this.zRange * -0.5) + (this.zRange * weight))

        c += 4;
        x++;
      }
      x = this.imageWidth * -0.5
      y--
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        amplitude: { value: 0.5}
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    })

    this.particle = new THREE.Points(geometry, material)
    this.scene.add(this.particle)

    // debug
    if (this.debug.active) {
      const debugObject = {
        'Animate': true
      }
      this.debug.ui.add(debugObject, "Animate").onChange(val => {
        this.isAnimated = val
      });
    }
  }
  update = () => {
    if (this.particle) {
      let { amplitude } = this.particle.material.uniforms
      this.isAnimated ? amplitude.value = Math.sin(performance.now() / 1000) : amplitude.value = 0.5
    }
  }
}
