import * as THREE from 'three'
import Experience from '../Experience';

export default class Outline {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.debug = this.experience.debug
    this.resources = this.experience.resources

    this.params = {
      thickness: 0.02,
      color: new THREE.Color(0x000000)
    }
    this.uniforms = {
      uThickness: { value: this.params.thickness },
      uColor: { value: this.params.color }
    }
    this.setEnv()
    this.setObject()
    this.setDebug()
  }
  setEnv = () => {
    this.camera.position.set(0, 0, 2)

    //
    this.scene.add(new THREE.AmbientLight(0xfae7e7, .5))
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5)
    dirLight1.position.set(10, 10, 5)
    this.scene.add(dirLight1)
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1)
    dirLight2.position.set(0, 10, 5)
    this.scene.add(dirLight2)
    const pointL = new THREE.PointLight(0xffffff, 1)
    pointL.position.set(0, -10, 5)
    this.scene.add(pointL)
  }
  setObject = () => {
    const group = new THREE.Group()
    this.scene.add(group)

    const geometry = new THREE.TorusKnotGeometry(0.6, 0.15, 100, 32)

    // front
    const front = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({ color: 'yellow', side: THREE.FrontSide}))
    group.add(front)

    // back for outline
    const material = new THREE.MeshLambertMaterial({
      color: this.params.color,
      side: THREE.BackSide
    })

    // Scale up the normal vector instead of the mesh
    material.onBeforeCompile = shader => {
      // uniforms
      shader.uniforms.uThickness = this.uniforms.uThickness
      shader.uniforms.uColor = this.uniforms.uColor

      // vert
      shader.vertexShader = `
        uniform float uThickness;
      ` + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace(
          `#include <begin_vertex>`,
          `
          #include <begin_vertex>
          transformed = position + objectNormal * uThickness;
          `
      )

      // frag
      shader.fragmentShader = `
      uniform vec3 uColor;
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
          `vec4 diffuseColor = vec4( diffuse, opacity );`,
          `vec4 diffuseColor = vec4( uColor, opacity );`
      )
    }
    const back = new THREE.Mesh(geometry, material)
    group.add(back)
  }

  /**
   * Try with FBX model, but failed to assign outline material
   * for backside of the model.
   * TODO: Need to check with glTF model also.
   */
  setModel = () => {
    const bunnyFront = this.resources.items.bunny.children[0]
    bunnyFront.name = 'Bunny'
    bunnyFront.scale.setScalar(1 / 300)
    this.scene.add(bunnyFront)

    const baseMaterial  = bunnyFront.material
    baseMaterial.side = THREE.FrontSide
    baseMaterial.needsUpdate = true

    //
    const outlineMat = baseMaterial.clone()
    outlineMat.side = THREE.BackSide
    outlineMat.onBeforeCompile = shader => {
      // uniforms
      shader.uniforms.uThickness = this.uniforms.uThickness
      shader.uniforms.uColor = this.uniforms.uColor

      // vert
      shader.vertexShader = `
        uniform float uThickness;
      ` + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace(
          `#include <begin_vertex>`,
          `
          #include <begin_vertex>
          transformed = position + objectNormal * uThickness;
          `
      )

      // frag
      shader.fragmentShader = `
      uniform vec3 uColor;
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
          `vec4 diffuseColor = vec4( diffuse, opacity );`,
          `vec4 diffuseColor = vec4( uColor, opacity );`
      )
    }
    outlineMat.needsUpdate = true
    const bunnyBack = bunnyFront.clone()
    bunnyBack.material = outlineMat
    this.scene.add(bunnyBack)
  }
  setDebug = () => {
    if(!this.debug.active) return

    const debugFolder = this.debug.ui.addFolder('Outline')
    debugFolder.add(this.params, 'thickness',0.01, 0.2, 0.001).onChange(val => {
      this.uniforms.uThickness.value = this.params.thickness
    })
    debugFolder.addColor(this.params, 'color').onChange(val => {
      this.uniforms.uColor.value = this.params.color
    })
  }
}
