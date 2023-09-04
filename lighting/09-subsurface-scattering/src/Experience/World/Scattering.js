import * as THREE from 'three'
import { SubsurfaceScatteringShader } from 'three/addons/shaders/SubsurfaceScatteringShader';
import Experience from '../Experience'

export default class Scattering {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources
    this.scene = this.experience.scene
    this.debug = this.experience.debug
  
    this.sssShader = SubsurfaceScatteringShader
    this.isChecked = true
    
    this.setModel()
    this.makeUniform()
  
    if (this.debug.active) {
      const debugObject = {
        'makeSSS': true,
      };
      this.debug.ui.add(debugObject, "makeSSS").onChange(val => {
        
        val ? this.makeUniform() : this.resetMaterial()
    
      });
    }
  }
  setModel = () => {
    this.model = this.resources.items.angelica.scene
    this.model.scale.setScalar(1/70)
    this.model.position.set(0, -5.5, 0)
    
    this.model.traverse(child => {
      child.receiveShadow = true
      child.castShadow = true
    })
  
    // find object needs to apply SSS
    this.head = this.model.getObjectByName('Head_Head_0')
    this.head_originalMat = this.head.material
    this.eye = this.model.getObjectByName('Eye_Eye_0')
    this.eye_originalMat = this.eye.material
    
    this.scene.add(this.model)
  }
  makeUniform = () => {
    // const thicknessMap = this.resources.items.bunny_thickness
    // thicknessMap.encoding = THREE.sRGBEncoding
    
    // head
    const headMap = this.resources.items.angelica_diffuse
    headMap.encoding = THREE.sRGBEncoding
    headMap.flipY = false
    const headSpecularMap = this.resources.items.angelica_specular
    headSpecularMap.encoding = THREE.sRGBEncoding
    const headNormalMap = this.resources.items.angelica_normal
    headNormalMap.encoding = THREE.sRGBEncoding
    const headAOMap = this.resources.items.angelica_occlusion
    headAOMap.encoding = THREE.sRGBEncoding
    const thicknessTexture = this.resources.items.angelica_diffuse
    thicknessTexture.flipY = false
    thicknessTexture.encoding = THREE.sRGBEncoding
  
    // eye
    const eyeMap = this.resources.items.angelica_eye_diffuse
    eyeMap.encoding = THREE.sRGBEncoding
    const eyeSpecularMap = this.resources.items.angelica_eye_diffuse
    eyeSpecularMap.encoding = THREE.sRGBEncoding
  
    // make uniform
    if (this.head) {
      const faceUniforms = THREE.UniformsUtils.clone(this.sssShader.uniforms)
      faceUniforms.map.value = headMap
      faceUniforms.specularMap.value = headSpecularMap
      faceUniforms.normalMap.value = headNormalMap
      faceUniforms.aoMap.value = headAOMap
      faceUniforms.normalScale.value = new THREE.Vector2(0.8, 0.8);
  
      // faceUniforms[ 'thicknessMap' ].value = thicknessTexture;
      // faceUniforms.thicknessColor.value = new THREE.Vector3( 0.5, 0.3, 0.0 );
      // faceUniforms.thicknessDistortion.value = 0.1;
      // faceUniforms.thicknessAmbient.value = 0.4;
      // faceUniforms.thicknessAttenuation.value = 0.8;
      // faceUniforms.thicknessPower.value = 2.0;
      // faceUniforms.thicknessScale.value = 1.0;
      //
      this.convertMat(this.head, faceUniforms, headMap)
    }
    if (this.eye) {
      const eyeUniforms = THREE.UniformsUtils.clone(this.sssShader.uniforms)
      eyeUniforms.map.value = eyeMap
      eyeUniforms.specularMap.value = eyeSpecularMap
      eyeUniforms.normalScale.value = new THREE.Vector2(0.8, 0.8);
      // eyeUniforms.thicknessScale.value = 1;
      // eyeUniforms.thicknessColor.value = new THREE.Vector3( 0.5, 0.3, 0.0 );
      // eyeUniforms.thicknessDistortion.value = 0.1;
      // eyeUniforms.thicknessAmbient.value = 0.4;
      // eyeUniforms.thicknessAttenuation.value = 0.8;
      // eyeUniforms.thicknessPower.value = 2.0;
  
      this.convertMat(this.eye, eyeUniforms, eyeMap)
    }
  }
  convertMat = (object, uniform, map) => {
    const material = new THREE.ShaderMaterial({
      uniforms: uniform,
      vertexShader: this.sssShader.vertexShader,
      fragmentShader: this.sssShader.fragmentShader,
      lights: true
    })
    material.extensions.derivatives = true
    material.map = map
  
    object.material = material
    object.material.needsUpdate = true
  }
  resetMaterial = () => {
    console.log(this.head, this.head_originalMat)
    
    this.head.material = this.head_originalMat
    this.head.material.needsUpdate = true
  
    this.eye.material = this.eye_originalMat
    this.eye.material.needsUpdate = true
  }
  update = () => {}
}
