import EventEmitter from './EventEmitter';

export default class Mouse extends EventEmitter {
  constructor() {
    super();

    this.mouse = { x: 0, y: 0}
    this.targetMouse = {x: 0, y: 0}

    window.addEventListener('mousemove', e => {
      this.handleMousemove(e)
      this.trigger('mousemove')
    })
  }
  handleMousemove = e => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1

    this.targetMouse.x = x
    this.targetMouse.y = y
  }
}
