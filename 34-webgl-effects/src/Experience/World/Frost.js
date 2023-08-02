import * as THREE from 'three'
import { FlakesTexture } from 'three/addons/textures/FlakesTexture'
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter'
import Experience from '../Experience'
import vertexShader from '../../shaders/frost.vert'
import fragmentShader from '../../shaders/frost.frag'

export default class Frost {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources

    this.options = {
      enableSwoopingCamera: false,
      enableRotation: true,
      transmission: 1,
      thickness: 1.2,
      roughness: 0.6,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      normalScale: 1,
      clearcoatNormalScale: 0.3,
      normalRepeat: 1
    };
    this.count = 0

    this.setEnv()
    // this.addFrost()
    this.addFrostedCube()
  }
  setEnv = () => {
    this.camera.position.set(0, 2, 25)
  }
  addFrost = () => {
    // https://www.shadertoy.com/view/XddcRr
    this.uniforms = {
      uColor: { value: new THREE.Color(0x1D267D)},
      uFrozenColor: { value: new THREE.Color(0xECF8F9)},
      uChannel0: { type: 't', value: this.resources.items.iChannel0},
      uChannel1: { type: 't', value: this.resources.items.iChannel1},
      uChannel2: { type: 't', value: this.resources.items.iChannel2},
      uTime: { type: 'f', value: 0.1},
    }
    this.uniforms.uChannel0.value.wrapS = this.uniforms.uChannel0.value.wrapT = THREE.RepeatWrapping
    this.uniforms.uChannel1.value.wrapS = this.uniforms.uChannel1.value.wrapT = THREE.RepeatWrapping
    this.uniforms.uChannel2.value.wrapS = this.uniforms.uChannel2.value.wrapT = THREE.RepeatWrapping

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      // blending: THREE.AdditiveBlending
    })

    const rightFrost = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1), material)
    // rightFrost.scale.setScalar(15)
    rightFrost.scale.setScalar(2)
    // rightFrost.position.set(12, 5, 0)
    this.scene.add(rightFrost)

    const leftFrost = rightFrost.clone()
    leftFrost.rotation.z = Math.PI/180 * -180
    leftFrost.position.x= -12
    this.scene.add(leftFrost)

    // lock plane into camera
    rightFrost.position.copy(this.camera.position)
    rightFrost.quaternion.copy(this.camera.quaternion)
    rightFrost.translateX(1)
    rightFrost.translateZ(-1)

    // sphere
    let texture = new THREE.CanvasTexture(new FlakesTexture)
    texture.wrapT = texture.wrapS = THREE.RepeatWrapping
    texture.repeat.x = 8
    texture.repeat.y = 4
    const flakeMat = new THREE.MeshPhysicalMaterial({
      clearcoat: 0.05,
      clearcoatRoughness: 0.1,
      metalness: 0,
      roughness: 1,
      color: 0x8418ca,
      normalMap: texture,
      normalScale: new THREE.Vector2(0.15, 0.15),
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    })
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64),
        flakeMat
    )
    sphere.position.set(0, 1.5, 0)
    sphere.scale.setScalar(5)
    // this.scene.add(sphere)
  }
  addFrostedCube = () => {
    // https://discourse.threejs.org/t/frost-effect-in-three-js/52174/4

    // canvas for texture
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height= 512*2
    this.ctx = canvas.getContext('2d')

    this.texture = new THREE.CanvasTexture(canvas)
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;

    // a cube with a canvas texture with freezing
    /*const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      transmission: this.options.transmission,
      thickness: this.options.thickness,
      roughness: this.options.roughness,
      envMap: this.scene.environment,
      envMapIntensity: this.options.envMapIntensity,
      clearcoat: this.options.clearcoat,
      clearcoatRoughness: this.options.clearcoatRoughness,
      normalScale: new THREE.Vector2(this.options.normalScale),
      alphaMap: this.texture,
      clearcoatNormalMap: this.texture,
      clearcoatNormalScale: new THREE.Vector2(this.options.clearcoatNormalScale)
    });*/
    const material = new THREE.MeshPhysicalMaterial( {
      transparent: true,
      opacity: 1,
      alphaMap: this.texture,
      bumpMap: this.texture,
      bumpScale: 0,
      side: THREE.DoubleSide,
      metalness: 1,
      roughness: 0,
    } )
    this.snowyPlane = new THREE.Mesh(new THREE.PlaneGeometry( 1, 1), material);
    // this.snowyPlane.scale.setScalar(5, 5, 5)
    // this.snowyPlane.position.set(0, 5, 1)
    this.scene.add( this.snowyPlane );

    // lock plane into camera
    this.snowyPlane.position.copy(this.camera.position)
    this.snowyPlane.quaternion.copy(this.camera.quaternion)
    this.snowyPlane.translateZ(-1)
  }
  drawPale = () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    // const x = (700*Math.sin(this.count*1.7-1)+700)%712 - 100
    // const y = (700*Math.sin(this.count*1.1+2)+700)%712 - 100

    const x = (1000*Math.sin(this.count*1.7-1)+1000)%1000 - 50
    const y = (1000*Math.sin(this.count*1.1+2)+1000)%1000 - 50

    const a = this.count;

    // this.ctx.globalAlpha = 3/255;
    this.ctx.rotate(a);
    this.ctx.drawImage(this.resources.items.pale.source.data, x, y)
    this.ctx.rotate(-a);

    this.texture.needsUpdate = true
    this.snowyPlane.material.bumpScale = Math.min( (this.count/300), 5 )
  }
  clearPale = () => {
    this.ctx.restore();
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect( 0, 0, 512*2, 512*2 );
  }
  update = () => {
    // this.uniforms.uTime.value = performance.now() / 1000

    //
    this.drawPale()
    if( this.count > 100 ) {
      this.clearPale( );
      this.count = 0;
    }
    this.count++;
  }
}
