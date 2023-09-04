import * as THREE from 'three'
import Experience from '../Experience'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils'
import { createNoise2D } from 'simplex-noise';

export default class ProceduralMap {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.MAX_HEIGHT = 10
    this.STONE_HEIGHT = this.MAX_HEIGHT * 0.8;
    this.DIRT_HEIGHT = this.MAX_HEIGHT * 0.7;
    this.GRASS_HEIGHT = this.MAX_HEIGHT * 0.5;
    this.SAND_HEIGHT = this.MAX_HEIGHT * 0.3;
    this.DIRT2_HEIGHT = this.MAX_HEIGHT * 0;

    this.stoneGeo = new THREE.BoxGeometry(0, 0, 0)
    this.dirtGeo = new THREE.BoxGeometry(0, 0, 0)
    this.dirt2Geo = new THREE.BoxGeometry(0, 0, 0)
    this.sandGeo = new THREE.BoxGeometry(0, 0, 0)
    this.grassGeo = new THREE.BoxGeometry(0, 0, 0)

    this.envMap = this.resources.items.royal_esplanade
    this.envMap.mapping = THREE.EquirectangularReflectionMapping
    this.addMap()
  }
  addMap = () => {
    const noise2D = createNoise2D();

    for (let i= -15; i<=15; i++) {
      for(let j=-15; j<= 15; j++) {
        const position = this.titleToPosition(i, j)

        // radius of circle
        if (position.length() > 16) continue;

        // https://github.com/jwagner/simplex-noise.js#migrating-from-3x-to-4x
        let noise = (noise2D(i*0.1, j*0.1)+1) * 0.5 // returns a value between -1 and 1
        noise = Math.pow(noise, 1.5)

        this.makeHex(noise * this.MAX_HEIGHT, position)
      }
    }

    //
    const stoneMesh = this.hexMesh(this.stoneGeo, this.resources.items.stone)
    const grassMesh = this.hexMesh(this.grassGeo, this.resources.items.grass)
    const dirt2Mesh = this.hexMesh(this.dirt2Geo, this.resources.items.dirt2)
    const dirtMesh = this.hexMesh(this.dirtGeo, this.resources.items.dirt)
    const sandMesh = this.hexMesh(this.sandGeo, this.resources.items.sand)
    this.scene.add(stoneMesh, grassMesh, dirt2Mesh, dirtMesh, sandMesh)

    //
    const seaMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(17, 17, this.MAX_HEIGHT * 0.2, 50),
        new THREE.MeshPhysicalMaterial({
          envMap: this.envMap,
          color: new THREE.Color(0x55aaff).multiplyScalar(3),
          ior: 1.4,
          transmission: 1,
          transparent: true,
          thickness: 1.5,
          envMapIntensity: 0.2,
          roughness: 1,
          metalness: 0.025,
          roughnessMap: this.resources.items.water,
          metalnessMap: this.resources.items.water
        })
    )
    seaMesh.receiveShadow = true
    seaMesh.position.set(0, this.MAX_HEIGHT* 0.1, 0)
    this.scene.add(seaMesh)

    //
    const mapContainer = new THREE.Mesh(
        new THREE.CylinderGeometry(17.1, 17.1, this.MAX_HEIGHT*0.25, 50, 1, true),
        new THREE.MeshPhysicalMaterial({
          envMap: this.envMap,
          map: this.resources.items.dirt,
          envMapIntensity: 0.2,
          side: THREE.DoubleSide
        })
    )
    mapContainer.receiveShadow = true
    mapContainer.position.set(0, this.MAX_HEIGHT * 0.125, 0)
    this.scene.add(mapContainer)

    //
    const mapFloor = new THREE.Mesh(
        new THREE.CylinderGeometry(18.5, 18.5, this.MAX_HEIGHT*0.1, 50),
        new THREE.MeshPhysicalMaterial({
          envMap: this.envMap,
          map: this.resources.items.dirt2,
          envMapIntensity: 0.1,
          side: THREE.DoubleSide
        })
    )
    mapFloor.receiveShadow = true
    mapFloor.position.set(0, -this.MAX_HEIGHT*0.05, 0)
    this.scene.add(mapFloor)

    this.makeCloud()
  }
  titleToPosition = (tileX, tileY) => {
    return new THREE.Vector2((tileX + (tileY%2) * 0.5) * 1.77, tileY*1.535)
  }
  hexGeometry = (height, position) => {
    let geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false)
    geo.translate(position.x, height* 0.5, position.y)

    return geo
  }
  makeHex = (height, position) => {
    let geo = this.hexGeometry(height, position)

    if(height > this.STONE_HEIGHT) {
      this.stoneGeo = mergeGeometries([geo, this.stoneGeo])
      if(Math.random() > 0.8) {
        this.stoneGeo = mergeGeometries([this.stoneGeo, this.makeStone(height, position)])
      }
    }
    else if(height > this.DIRT_HEIGHT) {
      this.dirtGeo = mergeGeometries([geo, this.dirtGeo])
      if(Math.random() > 0.8) {
        this.grassGeo = mergeGeometries([this.grassGeo, this.makeTree(height, position)])
      }
    }
    else if(height > this.GRASS_HEIGHT) {
      this.grassGeo = mergeGeometries([geo, this.grassGeo])
    }
    else if(height > this.SAND_HEIGHT) {
      this.sandGeo = mergeGeometries([geo, this.sandGeo])
      if(Math.random() > 0.8 && this.stoneGeo) {
        this.stoneGeo = mergeGeometries([this.stoneGeo, this.makeStone(height, position)])
      }
    }
    else if(height > this.DIRT2_HEIGHT) {
      this.dirt2Geo = mergeGeometries([geo, this.dirt2Geo])
    }
  }
  hexMesh = (geo, map) => {
    const mat = new THREE.MeshPhysicalMaterial({
      envMap: this.envMap,
      envMapIntensity: 0.135,
      flatShading: true,
      map: map
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.receiveShadow = true
    mesh.castShadow = true

    return mesh;
  }
  makeStone = (height, position) => {
    const px = Math.random() * 0.4
    const pz = Math.random() * 0.4

    const geo = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 7, 7)
    geo.translate(position.x + px, height, position.y + pz)

    return geo
  }
  makeTree = (height, position) => {
    const treeHeight = Math.random() * 1 + 1.25

    const geo = new THREE.CylinderGeometry(0, 1.5, treeHeight, 3)
    geo.translate(position.x, height + treeHeight * 0 + 1, position.y)

    const geo2 = new THREE.CylinderGeometry(0, 1.15, treeHeight, 3)
    geo2.translate(position.x, height + treeHeight * 0.6 + 1, position.y)

    const geo3 = new THREE.CylinderGeometry(0, 0.8, treeHeight, 3)
    geo3.translate(position.x, height + treeHeight * 1.25 + 1, position.y)

    return mergeGeometries([geo, geo2, geo3])
  }
  makeCloud = () => {
    let geo = new THREE.SphereGeometry(0, 0, 0);
    let count = Math.floor(Math.pow(Math.random(), 0.45) * 4);

    for(let i = 0; i < count; i++) {
      const puff1 = new THREE.SphereGeometry(1.2, 7, 7);
      const puff2 = new THREE.SphereGeometry(1.5, 7, 7);
      const puff3 = new THREE.SphereGeometry(0.9, 7, 7);

      puff1.translate(-1.85, Math.random() * 0.3, 0);
      puff2.translate(0,     Math.random() * 0.3, 0);
      puff3.translate(1.85,  Math.random() * 0.3, 0);

      const cloudGeo = mergeGeometries([puff1, puff2, puff3]);
      cloudGeo.translate(
          Math.random() * 20 - 10,
          Math.random() * 7 + 7,
          Math.random() * 20 - 10
      );
      cloudGeo.rotateY(Math.random() * Math.PI * 2);

      geo = mergeGeometries([geo, cloudGeo]);
    }

    const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          envMap: this.envMap,
          envMapIntensity: 0.75,
          flatShading: true,
          // transparent: true,
          // opacity: 0.85,
        })
    )
    this.scene.add(mesh)
  }
  update = () => {}
}
