import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass';

export default class AfterImage {
  constructor(composer) {
    this.composer = composer

    this.setEffect()
  }
  setEffect = () => {
    const afterimagePass = new AfterimagePass()
    afterimagePass.uniforms.damp.value = 0.6
    this.composer.addPass(afterimagePass)
  }
}
