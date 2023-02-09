import * as THREE from 'three'
import Experience from '../Experience';

export default class AnimationBox {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.clock = new THREE.Clock()

    this.currentBoxTile = 0
    this.currentBoxDisplayTime = 0

    this.currentPlaneTile = 0
    this.currentPlaneDisplayTime = 0
    this.params = {
      boxTilesHorizontal: 4,
      boxTilesVertical: 4,
      boxTilesNum: 16,
      boxTilesDuration: 75,
      planeTilesHorizontal: 10,
      planeTilesVertical: 1,
      planeTilesNum: 10,
      planeTilesDuration: 15,
    }

    this.setAnimationBox()
  }
  setAnimationBox = () => {
    // explosion
    this.explosionSeq = this.resources.items.explosion
    this.explosionSeq.minFilter = THREE.LinearFilter
    this.explosionSeq.encoding = THREE.sRGBEncoding
    this.explosionSeq.wrapS = this.explosionSeq.wrapT = THREE.RepeatWrapping
    const explosionMat = new THREE.MeshBasicMaterial({ map: this.explosionSeq, side: THREE.DoubleSide })

    const explosionBox = new THREE.Mesh(new THREE.BoxGeometry(1, 1), explosionMat)
    explosionBox.rotation.set(Math.PI/180 * 20, Math.PI/180 * 60, 0)
    explosionBox.position.x = 1
    this.scene.add(explosionBox)

    // runner
    this.runnerSeq = this.resources.items.run
    this.runnerSeq.minFilter = THREE.LinearFilter
    this.runnerSeq.encoding = THREE.sRGBEncoding
    this.runnerSeq.wrapS = this.runnerSeq.wrapT = THREE.RepeatWrapping
    const runnerMat = new THREE.MeshBasicMaterial({ map: this.runnerSeq, side: THREE.DoubleSide })

    const runnerMan = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), runnerMat)
    runnerMan.rotation.set(Math.PI/180 * 20, Math.PI/180 * 60, 0)
    runnerMan.position.x = -1
    this.scene.add(runnerMan)

    // debug
    if (this.debug.active) {
      this.debug.ui.add(this.params, 'boxTilesDuration', 10, 200, 1).onChange(val => {
        this.params.boxTilesDuration = val
      })
      this.debug.ui.add(this.params, 'planeTilesDuration', 10, 200, 1).onChange(val => {
        this.params.planeTilesDuration = val
      })
    }
  }
  animateExplosion = (textureSeq, tilesHorizontal, tilesVertical, numberOfTiles, tileDisplayDuration, milliSec) => {

    let currentColumn = this.currentBoxTile % tilesHorizontal
    let currentRow = Math.floor( this.currentBoxTile / tilesHorizontal )
    textureSeq.offset.x = currentColumn / tilesHorizontal
    textureSeq.offset.y = currentRow / tilesVertical
    textureSeq.repeat.set(1/ tilesHorizontal, 1/tilesVertical)

    this.currentBoxDisplayTime += milliSec

    while (this.currentBoxDisplayTime > tileDisplayDuration) {
      this.currentBoxDisplayTime -= tileDisplayDuration

      this.currentBoxTile++;
      if (this.currentBoxTile === numberOfTiles)
        this.currentBoxTile = 0;
    }
  }
  animateRunner = (textureSeq, tilesHorizontal, tilesVertical, numberOfTiles, tileDisplayDuration, milliSec) => {

    let currentColumn = this.currentPlaneTile % tilesHorizontal
    let currentRow = Math.floor( this.currentPlaneTile / tilesHorizontal )
    textureSeq.offset.x = currentColumn / tilesHorizontal
    textureSeq.offset.y = currentRow / tilesVertical
    textureSeq.repeat.set(1/ tilesHorizontal, 1/tilesVertical)

    this.currentPlaneDisplayTime += milliSec

    while (this.currentPlaneDisplayTime > tileDisplayDuration) {
      this.currentPlaneDisplayTime -= tileDisplayDuration

      this.currentPlaneTile++;
      if (this.currentPlaneTile === numberOfTiles)
        this.currentPlaneTile = 0;
    }
  }
  update = () => {
    const delta = this.clock.getDelta()
    const milliSec = 1000 * delta

    this.animateExplosion(
        this.explosionSeq,
        this.params.boxTilesHorizontal,
        this.params.boxTilesVertical,
        this.params.boxTilesNum,
        this.params.boxTilesDuration,
        milliSec)

    this.animateRunner(
        this.runnerSeq,
        this.params.planeTilesHorizontal,
        this.params.planeTilesVertical,
        this.params.planeTilesNum,
        this.params.planeTilesDuration,
        milliSec)
  }
}
