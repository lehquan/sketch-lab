import * as THREE from 'three'
import chroma from 'chroma-js'
import Experience from '../Experience'

export default class Stars {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources
    this.scene = this.experience.scene

    this.count = 1000

    this.addStars()
  }
  addStars = () => {
    const cscale = chroma.scale([0x00b9e0, 0xff880a, 0x5f1b90, 0x7ec08d])
    const positions = new Float32Array(this.count * 3)
    const colors = new Float32Array(this.count * 3)
    const sizes = new Float32Array(this.count)
    const rotations = new Float32Array(this.count)
    const sCoefs = new Float32Array(this.count)
    const position = new THREE.Vector3()
    let color;

    for(let i=0; i<this.count; i++) {
      position.set(
          THREE.MathUtils.randFloatSpread(1000),
          THREE.MathUtils.randFloatSpread(1000),
          THREE.MathUtils.randFloatSpread(2000))
      position.toArray(positions, i * 3)

      color = new THREE.Color(cscale(THREE.MathUtils.randFloat(0, 1)).hex())
      color.toArray(colors, i * 3);

      sizes[i] = THREE.MathUtils.randFloat(5, 100)
      sCoefs[i] = THREE.MathUtils.randFloat(0.0005, 0.005)
      rotations[i] = THREE.MathUtils.randFloat(0, Math.PI)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1))
    geometry.setAttribute('sCoef', new THREE.BufferAttribute(sCoefs, 1))

    this.uniforms = {
      uTime: { value: 0},
      uMouse: { value: new THREE.Vector2(0.2, 0.2)},
      uTexture: { value: this.resources.items.star},
    }
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      attribute vec3 color;
      attribute float size;
      attribute float rotation;
      attribute float sCoef;
      varying vec4 vColor;
      varying float vRotation;
      void main() {
        vColor = vec4(color, 1.);
        vRotation = rotation;

        vec3 p = vec3(position);
        p.z = -1000. + mod(position.z + uTime*(sCoef*50.*uMouse.y), 2000.);
        p.x = -500. + mod(position.x - uTime*(sCoef*50.*uMouse.x), 1000.);

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mvPosition;

        float psize = size * (200. / -mvPosition.z);
        gl_PointSize = psize * (1. + .5*sin(uTime*sCoef + position.x));
      }
    `,
      fragmentShader: `
      uniform sampler2D uTexture;
      varying vec4 vColor;
      varying float vRotation;
      void main() {
        vec2 v = gl_PointCoord - .5;
        float ca = cos(vRotation), sa = sin(vRotation);
        mat2 rmat = mat2(ca, -sa, sa, ca);
        gl_FragColor = vColor * texture2D(uTexture, v*rmat + .5);
      }
    `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    })

    this.points = new THREE.Points(geometry, material)
    this.scene.add(this.points)
  }
  update = () => {
    this.uniforms.uTime.value = performance.now()
  }
}
