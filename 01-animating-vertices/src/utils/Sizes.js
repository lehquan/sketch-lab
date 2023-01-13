import EventEmitter from "./EventEmitter.js";
import {EVT} from './contains';

export default class Sizes extends EventEmitter {
  constructor() {
    super();

    this.updateSizes();

    /**Resize Event Listener */
    window.addEventListener(EVT.RESIZE, () => {
      this.updateSizes();
      this.trigger(EVT.RESIZE);
    });
  }

  updateSizes() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }
}
