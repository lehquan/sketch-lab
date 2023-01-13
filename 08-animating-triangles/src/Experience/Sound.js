import * as THREE from 'three'
import Experience from './Experience'

export default class Sound {
  constructor() {
    this.experience = new Experience()
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources

    this.setSound()
  }
  setSound = () => {
    const listener = new THREE.AudioListener()
    this.camera.add(listener)

    this.sound = new THREE.Audio(listener)
  }
  play = (buffer, loop, volume, delay=0) => {
    this.sound.setBuffer( buffer )
    this.sound.setLoop( loop )
    this.sound.setVolume( volume )
    // this.sound.playbackRate = playbackRate // speed
    this.sound.play(delay)
  }
  dispose = () => {
    this.sound.stop()
  }
}
