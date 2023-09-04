import {EVT} from '../../utils/contains';

export default class Scroll {
  constructor() {
    this.scrollWeight = 500
    this.speed = 8
    this.maxSpeed = 20;
    this.acceleration = 0
    this.maxAcceleration = 5
    this.velocity = 0
    this.dampen = 0.97
    this.scrollPos = 0
    this.velocityThreshold = 1
    this.lastDelta = 0

    window.addEventListener(EVT.MOUSE_WHEEL, this.onMouseWheel)
    window.addEventListener(EVT.MOUSE_UP, this.onMouseUp)
    window.addEventListener(EVT.MOUSE_DOWN, this.onMouseDown)
  }
  onMouseWheel = ev => {
    ev.preventDefault()

    // The Math.sign() static method returns 1 or -1
    this.accelerate(Math.sign(ev.deltaY) * this.speed)
  }
  onMouseUp = ev => {
    ev.preventDefault()
    this.lastDelta = 0
    this.mouseDown = false
  }
  onMouseDown = ev => {
    ev.preventDefault()
    this.mouseDown = true
  }
  accelerate = amount => {
    if(this.acceleration < this.maxAcceleration) {
      this.acceleration += amount
    }
  }
  snap = (snapTarget, dampenThreshold = 100, velocityThresholdOffset = 1.5) => {
    if(Math.abs(snapTarget - this.scrollPos) < dampenThreshold) {
      this.velocity *= this.dampen
    }
    if(Math.abs(this.velocity) < this.velocityThreshold + velocityThresholdOffset) {
      this.scrollPos += (snapTarget - this.scrollPos) * 0.1
    }
  }
  update = () => {
    this.velocity += this.acceleration
    if(Math.abs(this.velocity) > this.velocityThreshold) {
      this.velocity *= this.dampen
      this.scrollPos += this.velocity
    }
    else this.velocity = 0

    if(Math.abs(this.velocity) > this.maxSpeed) {
      this.velocity = Math.sign(this.velocity) * this.maxSpeed
    }
    this.acceleration = 0
  }
}
