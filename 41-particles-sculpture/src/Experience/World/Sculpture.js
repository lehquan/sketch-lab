import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry, Color,
  Mesh, MeshBasicMaterial,
  MeshMatcapMaterial, Points,
  ShaderMaterial, Vector2, Vector3,
} from 'three';
import Experience from '../Experience';
import fragment from "../../shaders/sculpture.frag"
import particlesVert from "../../shaders/particles.vert"
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils';

export default class Sculpture {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources
    this.scene = this.experience.scene

    this.COUNT = 100000
    this.geometries = []
    this.addObject()
  }
  addObject = () => {
    const palette = [
        // new Color('#FAF1E4'),
        // new Color('#C08261'),
        // new Color('#CAEDFF'),
        // new Color('#FFBB5C'),

        // new Color('#C63D2F'),
        // new Color('#E25E3E'),
        // new Color('#FF9B50'),
        // new Color('#FFBB5C'),
        // new Color('#FFC26F'),
        // new Color('#F9E0BB'),
        // new Color('#F6635C'),

        new Color('#FAF0E6'),
        new Color('#B9B4C7'),
        new Color('#5C5470'),
        new Color('#352F44'),
      ];

    this.uniforms = {
      uTime: { value: 0.0 },
    }

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: particlesVert,
      fragmentShader: fragment,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    })
    const matcapMaterial = new MeshMatcapMaterial({
      matcap: this.resources.items.matcap,
    })

    this.model = this.resources.items.bust.scene.children[0].children[0].children[0]
    this.model.geometry.scale(5, 5, 5)
    this.model.geometry.translate(0, 0, -0.5)
    this.model.geometry.rotateX(-Math.PI / 2)
    this.model.geometry.rotateY(Math.PI / 2)
    this.model.geometry.center()
    this.model.material = this.material

    /*this.model = this.resources.items.bust.scene.children[0].children[0].children[0].children[0]
    this.model.geometry.scale(3, 3, 3)
    this.model.geometry.translate(0, 0, -0.5)
    this.model.geometry.rotateX(-Math.PI / 2)
    this.model.geometry.rotateY(Math.PI / 2)
    this.model.geometry.center()
    this.model.material = this.material*/

    // create particles
    let sampler = new MeshSurfaceSampler( this.model ).setWeightAttribute('uv').build()
    const geometry = new BufferGeometry();
    const pointPos = new Float32Array(this.COUNT * 3)
    const colors = new Float32Array(this.COUNT * 3)
    const sizes = new Float32Array(this.COUNT)
    const normals = new Float32Array(this.COUNT * 3)

    for (let i = 0; i < this.COUNT; i++) {
      const _position = new Vector3()
      const _normal = new Vector3()

      sampler.sample(_position, _normal)
      const random = palette[Math.floor(Math.random() * palette.length)]
      // .convertLinearToSRGB();

      pointPos.set([_position.x, _position.y, _position.z], i * 3)
      colors.set([random.r, random.g, random.b], i * 3)
      normals.set([_normal.x, _normal.y, _normal.z], i * 3)
      sizes.set([Math.random()], i)
    }
    geometry.setAttribute('position', new BufferAttribute(pointPos, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));
    geometry.setAttribute('normal', new BufferAttribute(normals, 3));

    let points = new Points(geometry, this.material)
    this.scene.add(points)

    // Create obside
    this.obsidiangeometry = this.model.geometry.clone()
    this.obside = new Mesh(this.obsidiangeometry, matcapMaterial)
    this.scene.add(this.obside)
  }
  update = () => {
    this.uniforms.uTime.value += 0.05
  }
}
