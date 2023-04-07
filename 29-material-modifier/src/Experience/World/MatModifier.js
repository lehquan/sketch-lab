import * as THREE from 'three'
import Experience from '../Experience'
export default class MatModifier {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.drawStartPos = new THREE.Vector2();
    this.lastPos = { x: 0, y: 0 }
    this.currPos = {x: 0, y: 0}
    this.isDrawing = false
    this.selectedObject = null

    this.setDrawingCanvas()
    this.setModel()
  }
  setModel = () => {
    const model = this.resources.items.ghost.scene
    // model.rotation.y = Math.PI
    model.position.set(0, -1, 0)
    model.scale.setScalar(.8)
    this.scene.add(model)

    // Set texture into canvas
    /*model.traverse(child => {
      if (child.material) {
        this.selectedObject = child

        const texture = child.material.map
        texture.flipY = false
        texture.needsUpdate = true

        this.drawingCanvas.width = texture.source.data.width
        this.drawingCanvas.height = texture.source.data.height
        this.drawingCtx.drawImage(texture.source.data, 0, 0)

        child.material.map = new THREE.CanvasTexture(
            this.drawingCanvas,
            THREE.UVMapping,
            THREE.RepeatWrapping,
            THREE.RepeatWrapping)
        child.material.map.encoding = THREE.sRGBEncoding
        child.material.map.flipY = false
        child.material.map.needsUpdate = true
      }
    })*/

    this.selectedObject = model.getObjectByName('Ghost_M_Ghost_0')
    const texture = this.selectedObject.material.map

    this.drawingCanvas.width = texture.source.data.width
    this.drawingCanvas.height = texture.source.data.height
    this.drawingCtx.drawImage(texture.source.data, 0, 0)

    this.selectedObject.material.map = new THREE.CanvasTexture(
        this.drawingCanvas,
        THREE.UVMapping,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping)
    this.selectedObject.material.map.encoding = THREE.sRGBEncoding
    this.selectedObject.material.map.flipY = false
    this.selectedObject.material.map.needsUpdate = true
  }
  setDrawingCanvas = () => {
    const textureDiv = document.querySelector('.textureDiv')
    this.drawingCanvas = document.createElement('canvas')
    this.drawingCtx = this.drawingCanvas.getContext('2d')
    textureDiv.appendChild(this.drawingCanvas)

    this.drawingCanvas.addEventListener('pointerdown',  (e) => {
      this.isDrawing = true
      this.drawStartPos.set( e.offsetX, e.offsetY );
    });
    this.drawingCanvas.addEventListener('pointermove', (e) => {
      if(this.isDrawing) this.draw(e.offsetX, e.offsetY );
    });
    this.drawingCanvas.addEventListener('pointerup', (e) => {
      this.isDrawing = false
    });
    this.drawingCanvas.addEventListener('pointerleave', (e) => {
      this.isDrawing = false
    });
  }
  setTextureCanvas = () => {
    const textureMap = document.querySelector('.textureMap')
    this.textureCanvas = document.createElement('canvas')
    this.textureCtx = this.textureCanvas.getContext('2d');
    textureMap.appendChild(this.textureCanvas)
  }
  draw = (x, y) => {
    this.drawingCtx.moveTo(this.drawStartPos.x, this.drawStartPos.y);
    this.drawingCtx.lineTo(x, y);
    this.drawingCtx.strokeStyle = '#ffff00';
    this.drawingCtx.lineWidth = 10;
    this.drawingCtx.lineCap = 'round';
    this.drawingCtx.stroke();
    this.drawingCtx.closePath();

    // reset drawing start position to current position.
    this.drawStartPos.set( x, y );
    this.selectedObject.material.map.needsUpdate = true
  }
  findMousePosition = (res, e) => {
    if (res === 'down') {
      this.lastPos.x = this.currPos.x;
      this.lastPos.y = this.currPos.y;
      this.currPos.x = e.clientX - this.drawingCanvas.offsetLeft;
      this.currPos.y = e.clientY - this.drawingCanvas.offsetTop;

      this.isDrawing = true;
    }
    if (res === 'up' || res === "out") {
      this.isDrawing = false;
    }
    if (res === 'move') {
      if (this.isDrawing) {
        this.lastPos.x = this.currPos.x;
        this.lastPos.y = this.currPos.y;
        this.currPos.x = e.clientX - this.drawingCanvas.offsetLeft;
        this.currPos.y = e.clientY - this.drawingCanvas.offsetTop;
        this.draw();
      }
    }
  }
  update = () => {
  }
}
