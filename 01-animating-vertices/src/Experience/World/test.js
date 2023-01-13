/* Utils ------------------------------------------ */
const textureLoader = new THREE.TextureLoader()

/* Scene Subjects ----------------------------------------- */
class PlaneSubject {
  raycaster = new THREE.Raycaster()
  scene = null

  constructor(scene) {
    const geometry = new THREE.PlaneBufferGeometry(5, 7)
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv; 

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float; 

        varying vec2 vUv; 

        uniform float dispFactor; 

        uniform sampler2D disp; 
        uniform sampler2D tex1; 
        uniform sampler2D tex2; 

        void main() {
          vec2 uv = vUv;

          vec4 disp = texture2D(disp, uv);

          float r = dispFactor * (1.0 + 0.05 * 2.0) - 0.05;
          float mixit = clamp((disp.r - r) * (1.0 / 0.05), 0.0, 1.0);

          vec4 _tex1 = texture2D(tex1, uv);
          vec4 _tex2 = texture2D(tex2, uv);

          if (_tex1.a < 0.5)discard;
          if (_tex2.a < 0.5)discard;

          gl_FragColor = mix(_tex2, _tex1, mixit);
        }
      `,
      uniforms: {
        dispFactor: {
          type: 'f',
          value: 0.0
        },
        tex1: {
          type: 't',
          value: textureLoader.load('https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ')
        },
        tex2: {
          type: 't',
          value: textureLoader.load('https://images.unsplash.com/photo-1504276048855-f3d60e69632f?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ')
        },
        disp: {
          type: 't',
          value: textureLoader.load('https://images.unsplash.com/photo-1517431397609-ab159afd52ed?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ')
        }
      }
    })
    material.transparent = true
    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)

    this.scene = scene
    this.mesh = mesh
  }

  update(delta, time) {}

  mouseHandler(mouse, camera) {
    const { scene, mesh, raycaster } = this

    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(scene.children)

    TweenMax.to(mesh.material.uniforms.dispFactor, 0.5, {
      value: intersects.length
    })

    TweenMax.to(mesh.scale, 0.5, {
      x: 1 - mouse.y * 0.1,
      y: 1 - mouse.y * 0.1
    })

    TweenMax.to(mesh.position, 0.5, {
      x: mouse.x
    })

    TweenMax.to(mesh.rotation, 0.5, {
      x: -mouse.y * (Math.PI / 3) * 0.3,
      y: mouse.x * (Math.PI / 3) * 0.3
    })
  }
}

/* Scene Manager ------------------------------------------------ */
class SceneManager {
  clock = new THREE.Clock()
  mouse = new THREE.Vector2()

  buildScene = () => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#111')

    return scene
  }

  buildRender = ({ width, height }) => {
    const { canvas } = this

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    })
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
    renderer.setPixelRatio(DPR)
    renderer.setSize(width, height)

    renderer.gammaInput = true
    renderer.gammaOutput = true

    return renderer
  }

  buildCamera = ({ width, height }) => {
    const aspectRatio = width / height
    const fieldOfView = 60
    const nearPlane = 1
    const farPlane = 100
    const camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    )
    camera.position.z = 8

    return camera
  }

  createSceneSubjects = scene => {
    const sceneSubjects = [new PlaneSubject(scene)]

    return sceneSubjects
  }

  constructor(canvas) {
    this.canvas = canvas
    this.screenDimentions = {
      width: this.canvas.width,
      height: this.canvas.height
    }

    this.scene = this.buildScene()
    this.renderer = this.buildRender(this.screenDimentions)
    this.camera = this.buildCamera(this.screenDimentions)
    this.sceneSubjects = this.createSceneSubjects(this.scene)
  }

  update() {
    const delta = this.clock.getDelta()
    const elapsed = this.clock.getElapsedTime()

    this.sceneSubjects.map(s => (s.update ? s.update(delta, elapsed) : null))

    this.renderer.render(this.scene, this.camera)
  }

  resizeHandler() {
    const { width, height } = this.canvas

    this.screenDimentions = { width, height }

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }

  mouseHandler(mousePos) {
    Object.assign(this.mouse, mousePos)

    this.sceneSubjects.map(s =>
        s.mouseHandler ? s.mouseHandler(this.mouse, this.camera) : null
    )
  }
}

/* Init stuff */
const canvas = document.getElementById('canvas')

const sceneManager = new SceneManager(canvas)

const resizeCanvas = () => {
  canvas.style.width = '100%'
  canvas.style.height = '100%'

  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  sceneManager.resizeHandler()
}

const mouseHandler = e => {
  sceneManager.mouseHandler({
    x: (e.clientX / window.innerWidth) * 2 - 1,
    y: -(e.clientY / window.innerHeight) * 2 + 1
  })
}

const bindEvents = () => {
  window.onresize = resizeCanvas
  resizeCanvas()

  window.onmousemove = mouseHandler
}

const render = () => {
  window.requestAnimationFrame(render)
  sceneManager.update()
}

bindEvents()
render()
