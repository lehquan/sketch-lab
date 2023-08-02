import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils'
import Experience from '../Experience'

export default class Lantern {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.count = 300

    this.setLantern()
  }

  /**
   * https://stackoverflow.com/questions/70647003/create-an-instancedbuffergeometry-from-existing-geometry-in-three-js
   */
  setLantern = () => {
    const geoms = [];
    // let pts = [
    //   new THREE.Vector2(0,    1. - 0),
    //   new THREE.Vector2(0.25, 1. - 0),
    //   new THREE.Vector2(0.25, 1. - 0.125),
    //   new THREE.Vector2(0.45, 1. - 0.125),
    //   new THREE.Vector2(0.45, 1. - 0.95)
    // ];
    // const geom = new THREE.LatheGeometry(pts, 20);
    // geoms.push(geom);
    //
    // const geomLight = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 20);
    // geoms.push(geomLight);


    const boxTop = new THREE.BoxGeometry(1, 0.5, 1)
    const boxBottom =  new THREE.BoxGeometry(1, 2, 1)
    geoms.push(boxTop, boxBottom)

    const fullGeom = BufferGeometryUtils.mergeGeometries(geoms)
    let instGeom = new THREE.InstancedBufferGeometry().copy(fullGeom)

    instGeom.instanceCount = this.count
    let instPos = [];
    let instSpeed = [];
    let instLight = []; // 2 (initial intensity, frequency)
    const n = 2, n2 = n / 2; // particles spread in the cube
    for (let i = 0; i < this.count ; i++){
      instPos.push( Math.random() * n - n2, Math.random() * n - n2, Math.random() * n - n2 )
      instSpeed.push( Math.random() *.25 + 1)
      instLight.push( Math.PI + (Math.PI * Math.random()), Math.random() + 5)
    }
    instGeom.setAttribute("instPos", new THREE.InstancedBufferAttribute(new Float32Array(instPos), 3, 1));
    instGeom.setAttribute("instSpeed", new THREE.InstancedBufferAttribute(new Float32Array(instSpeed), 1, 1));
    instGeom.setAttribute("instLight", new THREE.InstancedBufferAttribute(new Float32Array(instPos), 2, 1));

    // material
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {value: 0},
        uLight: {value: new THREE.Color(0xE3BE59).multiplyScalar(2.5)}, // yellow
        uTopColor: {value: new THREE.Color(0xF12F13).multiplyScalar(1)}, // red
        uBottomColor: {value: new THREE.Color(0x0E3EDA).multiplyScalar(1)} // blue
      },
      transparent: true,
      vertexShader:`
    uniform float uTime;

    attribute vec3 instPos;
    attribute float instSpeed;
    attribute vec2 instLight;

    varying vec2 vInstLight;
    varying float vY;
    
    void main() {
      
      vInstLight = instLight;
      vY = position.y;

      vec3 pos = vec3(position) * 2.;
      vec3 iPos = instPos * 200.;

      iPos.y = mod(iPos.y + 100. + (uTime * instSpeed), 200.) - 100.;
      pos += iPos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
    }
`,
      fragmentShader: `
    uniform float uTime;
    uniform vec3 uLight;
    uniform vec3 uTopColor;
    uniform vec3 uBottomColor;

    varying vec2 vInstLight;
    varying float vY; // position.y
    
    void main() {
      
      vec3 col = vec3(0);
      float t = vInstLight.x + (vInstLight.y * uTime * 4.);
      float ts = sin(t * 3.14) * 0.5 + 0.5;
      float tc = cos(t * 2.7) * 0.5 + 0.5;
      
      float f = smoothstep(0.12, 0.12 + (ts + tc) * 0.25, vY);
      float li = (0.5 + smoothstep(0., 1., ts * ts + tc * tc) * 0.5);
      
      col = mix(uLight * li, uTopColor * (0.75 + li * 0.25), f);
      
      col = mix(col, uBottomColor, step(vY, 0.05) * (0.75 + li * 0.25));

      gl_FragColor = vec4(col, 1.);
    }
`,
      side: THREE.DoubleSide
    });

    const lantern = new THREE.Mesh(instGeom, this.mat)
    lantern.scale.setScalar(1/6)
    lantern.position.y= -3
    this.scene.add(lantern);
  }
  update = () => {
    if (this.mat) this.mat.uniforms.uTime.value = performance.now() / 1000
  }
}
