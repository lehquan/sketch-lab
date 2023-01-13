import EventEmitter from './EventEmitter';
import {EVT} from './contains';

export default class Mouse extends EventEmitter {
  constructor() {
    super();

    this.mouse = { x: 0, y: 0}
    this.targetMouse = {x: 0, y: 0}

    window.addEventListener(EVT.MOUSE_MOVE, e => {
      this.handleMousemove(e)
      this.trigger(EVT.MOUSE_MOVE)
    })
  }
  handleMousemove = e => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1

    this.targetMouse.x = x
    this.targetMouse.y = y
  }
}
