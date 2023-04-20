import * as THREE from 'three'
import * as cv from 'opencv.js' // const cv = require('opencv.js');
import Experience from '../Experience'
export default class TestVideo {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.sizes = this.experience.sizes
    this.resources = this.experience.resources
    this.clock = new THREE.Clock()

    this.setDOM()
    this.startVideoStream()
    this.setModel()
    this.onOpenCvReady()
  }
  setDOM = () => {
    const wrapper = document.querySelector('.textureDiv')

    this.video = document.createElement('video')
    this.video.width = 640 //1024
    this.video.height = 460 //576
    wrapper.appendChild(this.video)

    this.outputCanvas = document.createElement('canvas')
    // this.outputCanvas.style.display = 'none'
    wrapper.appendChild(this.outputCanvas)

    // template
    // const img = this.resources.items.template.source.data
    // this.templateCanvas = document.createElement('canvas')
    // this.templateCanvas.width = img.width
    // this.templateCanvas.height = img.height
    // const ctx = this.templateCanvas.getContext("2d");
    // ctx.drawImage(img, 0, 0)
    // wrapper.appendChild(this.templateCanvas)
  }
  setModel = () => {
    this.fishModel = this.resources.items.fish
    this.fishModel.scene.scale.setScalar(4)
    this.fishModel.scene.position.set(-.5, -2, 0)
    this.fishModel.scene.rotation.set(0, Math.PI/180 * -30, 0)
    this.scene.add(this.fishModel.scene)

    // animation
    this.mixer = new THREE.AnimationMixer(this.fishModel.scene)
    this.mixer.clipAction(this.fishModel.animations[0]).play()

    // model.traverse(child => {
    //   if(child.material) console.log(child)
    // })

    this.selectedObject = this.fishModel.scene.getObjectByName('Discus_Final')
    const texture = this.selectedObject.material.map

    this.outputCanvas.width = texture.source.data.width
    this.outputCanvas.height = texture.source.data.height
    this.updateMaterial()
  }
  startVideoStream = () => {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { min: 1024, ideal: 1280, max: 1920 },
        height: { min: 576, ideal: 720, max: 1080 },
      },
    })
    .then(stream => {
      this.video.srcObject = stream;
      this.video.play();
    })
    .catch( err => {
      console.error("An error occurred! " + err);
    });
  }
  onOpenCvReady = () => {
    this.src = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC4)
    this.dst = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC1)
    this.cap = new cv.VideoCapture(this.video)
    this.mask = new cv.Mat()
    // this.templ = cv.imread(this.templateCanvas)
    this.dstNew = new cv.Mat();

    this.processVideo()
  }
  processVideo = () => {
    this.cap.read(this.src)

    // color
    cv.cvtColor(this.src, this.dst, cv.COLOR_BGR2BGRA, 0) // keep the same color
    cv.Canny(this.src, this.dst, 50, 100, 3, false)

    // cv.matchTemplate(this.dst, this.templ, this.dstNew, cv.TM_CCOEFF, this.mask);
    // let result = cv.minMaxLoc(this.dstNew, this.mask);
    // let maxPoint = result.maxLoc;
    // let color = new cv.Scalar(255, 0, 0, 255);
    // let point = new cv.Point(maxPoint.x + this.templ.cols, maxPoint.y + this.templ.rows);
    // cv.rectangle(this.dst, maxPoint, point, color, 2, cv.LINE_8, 0);

    // crop image
    // let rect = new cv.Rect(100, 200, 200, 200)
    // this.dst = this.src.roi(rect)

    // show
    cv.imshow(this.outputCanvas, this.dst)

    this.updateMaterial()
  }
  updateMaterial = () => {
    this.selectedObject.material.map = new THREE.CanvasTexture(
        this.outputCanvas,
        THREE.UVMapping,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping)
    this.selectedObject.material.map.encoding = THREE.sRGBEncoding
    this.selectedObject.material.side = THREE.DoubleSide
    this.selectedObject.material.map.flipY = false
    this.selectedObject.material.map.needsUpdate = true
  }
  update = () => {
    // mixer
    if (this.mixer) this.mixer.update(this.clock.getDelta())
    this.processVideo()
  }
}
