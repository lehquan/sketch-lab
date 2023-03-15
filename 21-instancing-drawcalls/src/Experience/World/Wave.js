import * as THREE from 'three'
import Experience from '../Experience'
import noiseVertex from '../../shaders/noise.vert'

export default class Wave {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.setWave()
  }
  setWave = () => {
    const pts = [];
    const count = 7000;
    const cylLength = 50
    const angleStep = Math.PI * 0.025;
    const heightStep = cylLength / (count - 1);

    for (let i = 0; i < count; i++) {
      let h = heightStep * i;
      let uvY = h / cylLength;
      pts.push(
          new THREE.Vector3().setFromCylindricalCoords(
              4 + 6 * Math.sin(uvY * Math.PI * 0.5),
              angleStep * i,
              cylLength * -0.5 + h
          )
      );
    }

    const curve = new THREE.CatmullRomCurve3(pts)
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getSpacedPoints(count))
    this.uniforms = {
      uCylLength: { value: cylLength},
      uTime: { value: 0}
    }
    const mat = new THREE.PointsMaterial({
      size: 1.0,
      color: 0xFF0000,
      onBeforeCompile: shader => {
        shader.uniforms.uCylLength = this.uniforms.uCylLength;
        shader.uniforms.uTime = this.uniforms.uTime;
        shader.vertexShader = `
      uniform float uTime;
      uniform float uCylLength;
      varying float vNoiseVal;
      ${noiseVertex}
      ${shader.vertexShader}
    `.replace(
            `#include <begin_vertex>`,
            `#include <begin_vertex>
        
        float n31 = snoise(transformed  * 0.125 - vec3(0., uTime * 0.1, 0.));
        vNoiseVal = n31;
        n31 = (n31 - 0.5) * 2.;
        
        vec2 xzN = normalize(transformed.xz);
        transformed *= vec3(0.3, 0.3, 0.25);
        float k = (position.y - uCylLength * -0.5 + 0.001) / uCylLength+0.001;
        transformed.xz += xzN * n31 * (k * 0.25 + 1.);
      `
        );
        shader.fragmentShader = `
      varying float vNoiseVal;
      ${shader.fragmentShader}
    `.replace(
            `#include <clipping_planes_fragment>`,
            `#include <clipping_planes_fragment>
        if(length(gl_PointCoord - 0.5) > 0.5) discard; // make'em round
      `
        ).replace(
            `#include <color_fragment>`,
            `#include <color_fragment>

        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0, 1, 1), clamp(pow(vNoiseVal, 0.75), 0., 1.));
      `
        );
      }
    })

    const wave = new THREE.Points(geo, mat)
    wave.position.set(0, 0, 50)
    wave.rotation.set(0, 0, 0)
    wave.scale.setScalar(20)
    this.scene.add(wave)
  }
  update = () => {
    if(this.uniforms) {
      this.uniforms.uTime.value = performance.now() * 0.001
    }
  }
}
