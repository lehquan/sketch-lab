import * as THREE from 'three'
import Experience from '../Experience';

export default class AnimationBox {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.clock = new THREE.Clock()

    this.currentBoomTile = 0
    this.currentBoomDisplayTime = 0

    this.currentRunnerTile = 0
    this.currentRunnerDisplayTime = 0

    this.currentFlameTile = 0
    this.currentFlameDisplayTime = 0

    this.params = {
      boomTilesHorizontal: 4,
      boomTilesVertical: 4,
      boomTilesNum: 16,
      boomTilesDuration: 75,

      runnerTilesHorizontal: 10,
      runnerTilesVertical: 1,
      runnerTilesNum: 10,
      runnerTilesDuration: 15,

      flameTilesHorizontal: 16,
      flameTilesVertical: 4,
      flameTilesNum: 64,
      flameTilesDuration: 30,
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
    explosionBox.position.x = 2
    this.scene.add(explosionBox)

    // runner
    this.runnerSeq = this.resources.items.run
    this.runnerSeq.minFilter = THREE.LinearFilter
    this.runnerSeq.encoding = THREE.sRGBEncoding
    this.runnerSeq.wrapS = this.runnerSeq.wrapT = THREE.RepeatWrapping
    const runnerMat = new THREE.MeshBasicMaterial({ map: this.runnerSeq, side: THREE.DoubleSide })

    const runnerMan = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), runnerMat)
    runnerMan.rotation.set(Math.PI/180 * 20, 0, 0)
    this.scene.add(runnerMan)

    // flame
    this.flameSeq = this.resources.items.flame
    this.flameSeq.minFilter = THREE.LinearFilter
    this.flameSeq.encoding = THREE.sRGBEncoding
    this.flameSeq.wrapS = this.flameSeq.wrapT = THREE.RepeatWrapping
    const flameMat = new THREE.MeshBasicMaterial({ map: this.flameSeq, side: THREE.DoubleSide })
    const flameMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flameMat)
    flameMesh.rotation.set(Math.PI/180 * 20, Math.PI/180 * 60, 0)
    flameMesh.position.x = -2
    this.scene.add(flameMesh)

    // debug
    if (this.debug.active) {
      this.debug.ui.add(this.params, 'boomTilesDuration', 10, 200, 1).onChange(val => {
        this.params.boomTilesDuration = val
      })
      this.debug.ui.add(this.params, 'runnerTilesDuration', 10, 200, 1).onChange(val => {
        this.params.runnerTilesDuration = val
      })
      this.debug.ui.add(this.params, 'flameTilesDuration', 10, 200, 1).onChange(val => {
        this.params.flameTilesDuration = val
      })
    }
  }
  animateExplosion = (textureSeq, tilesHorizontal, tilesVertical, numberOfTiles, tileDisplayDuration, milliSec) => {

    let currentColumn = this.currentBoomTile % tilesHorizontal
    let currentRow = Math.floor( this.currentBoomTile / tilesHorizontal )
    textureSeq.offset.x = currentColumn / tilesHorizontal
    textureSeq.offset.y = currentRow / tilesVertical
    textureSeq.repeat.set(1/ tilesHorizontal, 1/tilesVertical)

    this.currentBoomDisplayTime += milliSec

    while (this.currentBoomDisplayTime > tileDisplayDuration) {
      this.currentBoomDisplayTime -= tileDisplayDuration

      this.currentBoomTile++;
      if (this.currentBoomTile === numberOfTiles)
        this.currentBoomTile = 0;
    }
  }
  animateRunner = (textureSeq, tilesHorizontal, tilesVertical, numberOfTiles, tileDisplayDuration, milliSec) => {

    let currentColumn = this.currentRunnerTile % tilesHorizontal
    let currentRow = Math.floor( this.currentRunnerTile / tilesHorizontal )
    textureSeq.offset.x = currentColumn / tilesHorizontal
    textureSeq.offset.y = currentRow / tilesVertical
    textureSeq.repeat.set(1/ tilesHorizontal, 1/tilesVertical)

    this.currentRunnerDisplayTime += milliSec

    while (this.currentRunnerDisplayTime > tileDisplayDuration) {
      this.currentRunnerDisplayTime -= tileDisplayDuration

      this.currentRunnerTile++;
      if (this.currentRunnerTile === numberOfTiles)
        this.currentRunnerTile = 0;
    }
  }
  animateFlame = (textureSeq, tilesHorizontal, tilesVertical, numberOfTiles, tileDisplayDuration, milliSec) => {

    let currentColumn = this.currentFlameTile % tilesHorizontal
    let currentRow = Math.floor( this.currentFlameTile / tilesHorizontal )
    textureSeq.offset.x = currentColumn / tilesHorizontal
    textureSeq.offset.y = currentRow / tilesVertical
    textureSeq.repeat.set(1/ tilesHorizontal, 1/tilesVertical)

    this.currentFlameDisplayTime += milliSec

    while (this.currentFlameDisplayTime > tileDisplayDuration) {
      this.currentFlameDisplayTime -= tileDisplayDuration

      this.currentFlameTile++;
      if (this.currentFlameTile === numberOfTiles)
        this.currentFlameTile = 0;
    }
  }

  update = () => {
    const delta = this.clock.getDelta()
    const milliSec = 1000 * delta

    this.animateExplosion(
        this.explosionSeq,
        this.params.boomTilesHorizontal,
        this.params.boomTilesVertical,
        this.params.boomTilesNum,
        this.params.boomTilesDuration,
        milliSec)

    this.animateRunner(
        this.runnerSeq,
        this.params.runnerTilesHorizontal,
        this.params.runnerTilesVertical,
        this.params.runnerTilesNum,
        this.params.runnerTilesDuration,
        milliSec)

    this.animateFlame(
        this.flameSeq,
        this.params.flameTilesHorizontal,
        this.params.flameTilesVertical,
        this.params.flameTilesNum,
        this.params.flameTilesDuration,
        milliSec)
  }
}
