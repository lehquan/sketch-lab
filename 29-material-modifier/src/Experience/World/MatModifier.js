import * as THREE from 'three'
import Experience from '../Experience'
export default class MatModifier {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    // last known position
    this.lastPos = { x: 0, y: 0 }
    this.currPos = {x: 0, y: 0}
    this.isDrawing = false;

    this.setDrawingCanvas()
    this.setModel()
  }
  setModel = () => {
    const model = this.resources.items.potato.scene
    model.rotation.y = Math.PI
    this.scene.add(model)

    // Set texture into canvas
    model.traverse(child => {
      if (child instanceof THREE.Mesh) {
        const image = child.material.map.image
        this.canvas.height = image.height
        this.canvas.width = image.width
        this.ctx.drawImage(image, 0, 0)
      }
    })
  }
  setDrawingCanvas = () => {
    const textureDiv = document.querySelector('.textureDiv')
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d');
    textureDiv.appendChild(this.canvas)

    this.canvas.addEventListener("mousemove",  (e) => {
      this.findxy('move', e)
    }, false);
    this.canvas.addEventListener("mousedown", (e) => {
      this.findxy('down', e)
    }, false);
    this.canvas.addEventListener("mouseup", (e) => {
      this.findxy('up', e)
    }, false);
    this.canvas.addEventListener("mouseout", (e) => {
      this.findxy('out', e)
    }, false);
  }
  draw = () => {
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastPos.x, this.lastPos.y);
    this.ctx.lineTo(this.currPos.x, this.currPos.y);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
    this.ctx.closePath();
  }
  findxy = (res, e) => {
    if (res === 'down') {
      this.lastPos.x = this.currPos.x;
      this.lastPos.y = this.currPos.y;
      this.currPos.x = e.clientX - this.canvas.offsetLeft;
      this.currPos.y = e.clientY - this.canvas.offsetTop;

      this.isDrawing = true;
    }
    if (res === 'up' || res === "out") {
      this.isDrawing = false;
    }
    if (res === 'move') {
      if (this.isDrawing) {
        this.lastPos.x = this.currPos.x;
        this.lastPos.y = this.currPos.y;
        this.currPos.x = e.clientX - this.canvas.offsetLeft;
        this.currPos.y = e.clientY - this.canvas.offsetTop;
        this.draw();
      }
    }
  }
  update = () => {

  }
}
