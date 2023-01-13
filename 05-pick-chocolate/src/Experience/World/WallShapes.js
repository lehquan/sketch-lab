import * as THREE from 'three'
import { gsap } from 'gsap'
import Experience from '../Experience'
import Cone from './components/Cone';
import Torus from './components/Torus';
import {distance, hexToRgb, map, radians} from '../../utils/utils';
import Bar from './components/Bar';
import Heart from './components/Heart';

export default class WallShapes {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug

    this.raycaster = new THREE.Raycaster()
    this.gutter = { size: 1}
    this.meshes = []
    this.grid = { cols: 14, rows: 6}
    this.mouse = new THREE.Vector2()
    this.geometries = [new Bar(), new Torus(), new Cone(), new Heart()]

    // debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('Mesh Material')
    }

    window.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true})
    this.onMouseMove({ clientX: 0, clientY: 0 });

    this.setWall()
    this.setFloor()
  }
  setWall = () => {
    this.groupMesh = new THREE.Object3D()
    this.groupMesh.rotation.x = Math.PI/180 * -40

    /*const meshParams = {
      color: '#ff00ff',
      emissive: '#000000',
      metalness: 0.58,
      roughness: 0.18,
    };*/
    const meshParams = {
      color: '#372414',
      metalness: 0.6, //.58,
      emissive: '#000000',
      roughness: 0.5, //.05,
    };
    const material = new THREE.MeshPhysicalMaterial(meshParams)

    // debug
    if(this.debug.active){
      this.debugFolder.addColor(meshParams, 'color').onChange(val => {
        material.color = hexToRgb(val)
      })
      this.debugFolder.addColor(meshParams, 'emissive').onChange(val => {
        material.emissive = hexToRgb(val)
      })
      this.debugFolder.add(meshParams, 'metalness', 0.1, 1).onChange(val => {
        material.metalness = val
      })
      this.debugFolder.add(meshParams, 'roughness', 0.1, 1).onChange(val => {
        material.roughness = val
      })
    }

    for(let i=0; i< this.grid.rows; i++) {
      this.meshes[i] = []

      for(let j=0; j< this.grid.cols; j++) {
        const geo = this.getRandomGeometry()
        const mesh = this.getMesh(geo.geometry, material)

        mesh.position.set(j + (j * this.gutter.size), 0, i + (i * this.gutter.size))
        mesh.rotation.set(geo.rotationX, geo.rotationY, geo.rotationZ)

        mesh.initialRotation = {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        }
        this.groupMesh.add(mesh)

        this.meshes[i][j] = mesh
      }
    }

    const centerX = ((this.grid.cols - 1) + ((this.grid.cols - 1) * this.gutter.size)) * 0.5;
    const centerZ = ((this.grid.rows - 1) + ((this.grid.rows - 1) * this.gutter.size)) * 0.5;
    this.groupMesh.position.set(-centerX, 0, -3)

    // const centerX = -(this.grid.cols / 2) * this.gutter.size - 1;
    // const centerZ = -(this.grid.rows / 2) - .8;
    // this.groupMesh.position.set(centerX, 0, centerZ);

    this.scene.add(this.groupMesh)
  }
  setFloor = () => {
    const geometry = new THREE.PlaneGeometry(2000, 2000)
    // const material = new THREE.ShadowMaterial({
    //   opacity: 0.3
    // })
    const material = new THREE.MeshPhongMaterial( {
      color: 0x808080,
      transparent: true,
      opacity: 1
    } );
    this.floor = new THREE.Mesh(geometry, material)
    this.floor.position.y = 0
    // this.floor.position.set(0, - 0.05, 0)
    this.floor.receiveShadow = true
    this.floor.rotateX(-Math.PI/2)
    this.scene.add(this.floor)
  }
  getRandomGeometry = () => {
    return this.geometries[Math.floor(Math.random() * Math.floor(this.geometries.length))];
  }
  getMesh = (geometry, material) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = mesh.receiveShadow = true

    return mesh
  }
  onMouseMove = (e) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  }
  update = () => {
    this.raycaster.setFromCamera(this.mouse, this.camera)

    const intersects = this.raycaster.intersectObjects([this.floor])
    if (intersects.length> 0) {

      const { x, z } = intersects[0].point;

      for (let i = 0; i < this.grid.rows; i++) {
        for (let j = 0; j < this.grid.cols; j++) {

          const mesh = this.meshes[i][j]

          const mouseDistance = distance(x, z, mesh.position.x + this.groupMesh.position.x, mesh.position.z + this.groupMesh.position.z)

          const maxPositionY = 10
          const minPositionY = 0
          const startDistance = 6
          const endDistance = 0
          const y = map(mouseDistance, startDistance, endDistance, minPositionY, maxPositionY)
          gsap.to(mesh.position, {
            duration: 0.7,
            y: y < 1 ? 1 : y
          })

          const scaleFactor = mesh.position.y / 2.1;
          const scale = scaleFactor < 1 ? 1 : scaleFactor;
          gsap.to(mesh.scale, {
            duration: 0.7,
            x: scale,
            y: scale,
            z: scale,
            ease: "Expo.easeOut"
          })

          gsap.to(mesh.rotation, {
            duration: 0.5,
            x: map(mesh.position.y, -1, 1, radians(45), mesh.initialRotation.x),
            y: map(mesh.position.y, -1, 1, radians(-90), mesh.initialRotation.y),
            z: map(mesh.position.y, -1, 1, radians(90), mesh.initialRotation.z),
            ease: "Expo.easeOut"
          })

        }
      }
    }
  }
}
