import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/particle.vert'
import fragmentShader from '../../shaders/particle.frag'
import {EVT} from '../../utils/contains';

export default class AudioVisualizer {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.controls = this.experience.camera.controls
    this.renderer = this.experience.renderer.instance
    this.resources = this.experience.resources

    this.weight = [0.2, 0.7, 0.1]
    this.zRange = 100 // max
    this.analyser = null
    this.fftSize = 1024

    this.createImageData()
    window.addEventListener(EVT.START_EXPERIENCE, this.init)
  }
  init = () => {
    // environment
    this.setEnv()

    // audio
    const listener = new THREE.AudioListener()
    const audio = new THREE.Audio( listener )
    const buffer = this.resources.items.Inuyasha
    audio.setBuffer(buffer)
    audio.setLoop(false)
    audio.play()

    this.analyser = new THREE.AudioAnalyser( audio, this.fftSize );
    this.dataArray = this.analyser.getFrequencyData()

    // particle
    this.setParticle()
    this.setFooter()
  }
  setEnv = () => {
    this.controls.maxDistance = 500
    this.controls.minDistance = 100
  }
  setFooter = () => {
    const footer = document.getElementById('footer')

    const title = document.createElement('p')
    title.classList.add('title')
    title.innerHTML = 'Extract image data to create particles, and using ' +
        '<a href="https://threejs.org/docs/#api/en/audio/AudioAnalyser" target="blank">THREE.AudioAnalyser</a> ' +
        'for 3D Audio and vertex animation.'
    footer.appendChild(title)

    const info = document.createElement('p')
    info.innerHTML = 'USE DEBUG MODE (#debug) FOR TESTING'
    // footer.appendChild(info)

    const link = document.createElement('p')
    link.innerHTML =
        'Song: <a href="https://youtu.be/lSCHU3kwrm8" target="blank">Inuyasha 犬夜叉, </a>' +
        'Flower: <a href="https://www.google.com/" target="blank">Internet</a>'
    footer.appendChild(link)
  }
  setDebug = () => {
    if(!this.debug.active) return

    const debugObject = {
      'Animate': true
    }
    this.debug.ui.add(debugObject, "Animate").onChange(val => {
      this.isAnimated = val
    })
  }
  createImageData = () => {
    const image = this.resources.items.poster.source.data
    image.minFilter = THREE.LinearFilter
    image.magFilter = THREE.LinearFilter
    image.format = THREE.sRGBEncoding

    this.imageWidth = this.resources.items.poster.source.data.width
    this.imageHeight = this.resources.items.poster.source.data.height

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = this.imageWidth
    canvas.height = this.imageHeight

    context.fillStyle = context.createPattern(image, 'no-repeat')
    context.fillRect(0, 0, this.imageWidth, this.imageHeight)

    this.imageData = context.getImageData(0, 0, this.imageWidth, this.imageHeight, { colorSpace: "srgb" }).data
    // console.log(this.imageData);
  }
  setParticle = () => {
    let index = 0

    const geometry = new THREE.BufferGeometry()
    const vertices = []
    const colors = []

    let x = this.imageWidth
    let y = this.imageHeight

    for(let i = 0; i < this.imageHeight; i++) {
      for (let j=0; j< this.imageWidth; j++) {
        let color = new THREE.Color()
        color.setRGB(this.imageData[index] / 255, this.imageData[index+1] / 255, this.imageData[index+2] / 255)
        colors.push(color.r, color.g, color.b)

        const weight = (color.r + color.g + color.b)/3
        vertices.push(x, y, this.zRange * weight)

        index += 4;
        x++;
      }
      x = this.imageWidth
      y--
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.center()

    this.uniforms = {
      uDataArray: {
        type: "float[64]",
        value: this.dataArray,
      },
      uAmplitude: { value: 20.0},
      uSize: { value: 2.0},
    }
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
    })

    this.particle = new THREE.Points(geometry, material)
    this.scene.add(this.particle)
  }
  update = () => {
    if (this.particle) {

      this.analyser.getFrequencyData()
      this.uniforms.uDataArray.value.needsUpdate = true
      this.uniforms.uDataArray.value = this.dataArray
      // console.log(this.dataArray)
      // this.uniforms.uAmplitude.value = Math.sin(performance.now() / 1000)

      // let { uAmplitude } = this.particle.material.uniforms
      // this.isAnimated ? uAmplitude.value = Math.sin(performance.now() / 1000) : uAmplitude.value = 0.5
    }
  }
}
