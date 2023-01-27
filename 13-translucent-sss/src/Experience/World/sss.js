import * as THREE from 'three'
import Experience from '../Experience'
import vertexShader from '../../shaders/sss.vert'
import fragmentShader from '../../shaders/sss.frag'
export default class SSS {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setObject()
  }
  setObject = () => {
    // This indicates where the light is
    this.sphere = new THREE.Mesh(new THREE.SphereGeometry(0.02, 32, 32), new THREE.MeshBasicMaterial())
    // this.scene.add(this.sphere)

    this.sssUniforms = {
      uLightPos: { value: new THREE.Vector3(0, 0, -0.1) },
      uTranslucencyColor: { value: new THREE.Color(0xAACB73) },
      uLightColor: { value: new THREE.Color(0xffffff) },
      uLightIntensity: { value: 0.2},
    }
    const sssMaterial = new THREE.ShaderMaterial({
      uniforms: this.sssUniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    })

    // model
    this.model = this.resources.items.statue.scene
    // this.model.scale.setScalar(1/50)
    // this.model.rotation.set(Math.PI/180 * 20, Math.PI/180 * -30, 0)

    this.model.rotation.set(0, Math.PI/180 * -180, 0)
    this.model.position.y = -1.5
    this.model.traverse(child => {
      if (child.material) {
        child.material = sssMaterial

        // option 2:
        /*child.material.onBeforeCompile = shader => {
          shader.uniforms.uLightPos = this.sssUniforms.uLightPos

          shader.vertexShader = `
          varying vec3 vFragmentPos;
          ` + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace(
              `#include <begin_vertex>`,
              `#include <begin_vertex>
                          vFragmentPos =  (modelMatrix * vec4( position, 1.0 )).xyz;
                          vNormal =  (modelMatrix * vec4( normal, 0.0 )).xyz;
                         `
          )

          shader.fragmentShader = `
          varying vec3 vFragmentPos;
          uniform vec3 uLightPos;
          ` + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace(
              `#include <dithering_fragment>`,
              `#include <dithering_fragment>
                          vec3 lightColor0 = vec3(1.0, 0.5, 0.5);
                          vec3 translucencyColor = vec3(0.8, 0.2, 0.2);
                          float lightIntensity0 = 0.2;

                          vec3 toLightVector = uLightPos - vFragmentPos;
                          float lightDistanceSQ = pow(distance(vec3(0.), toLightVector), 2.0) ;

                          vec3 lightDir = normalize(toLightVector);

                          float ndotl = max(0.0, dot(vNormal, lightDir)); // 0~1
                          float inversendotl = step(0.0, dot(vNormal, -lightDir));

                          vec3 lightColor = lightColor0.rgb * ndotl / lightDistanceSQ * lightIntensity0;
                          vec3 subsurfacecolor = translucencyColor.rgb * inversendotl / lightDistanceSQ * lightIntensity0;

                          vec3 final = subsurfacecolor + lightColor;
                          gl_FragColor = vec4(final, 1.);
                         `
          )

          this.materialShader = shader
        }*/
      }
    })
    this.scene.add(this.model)
  }
  update = () => {
    const min = -1.5 // 0.5
    const max = 0.4
    const h = Math.sin(performance.now() / 1500) * min + max

    // this.sphere.position.y = h;
    this.sssUniforms.uLightPos.value.y = h;
  }
}
