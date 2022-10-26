import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { gsap } from 'gsap';

class Transform {
  constructor() {
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.objects = []
    this.origin = null
    
    this.init()
    this.createObject()
  }
  
  init = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    
    // camera
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0,0,0)
    
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xaaaaaa, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
    
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x362f2d)
  
    // light
    const pointLight = new THREE.PointLight(0xffffff, 1.5)
    pointLight.position.set(0, 0, 0)
    this.scene.add(pointLight)
    const ambientLight = new THREE.AmbientLight(0xffffff, .5)
    this.scene.add(ambientLight)
    
    const gridHelper = new THREE.GridHelper(10, 10)
    this.scene.add(gridHelper)
    
    // controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxDistance = 20
    this.controls.update()
    this.origin = this.camera.clone()
    
    this.on()
    this.update()
  };
  
  on = () => {
    window.addEventListener( 'click', this.onPointerMove );
    window.addEventListener('resize', this.windowResize);
  };
  
  createObject = () => {
    const group = new THREE.Group()
    this.scene.add(group)
    
    const purple = new THREE.Mesh(new THREE.SphereGeometry(.2, 32, 32), new THREE.MeshLambertMaterial({color: 0x351c75}))
    purple.position.set(-1.76, 0, 2.89)
    group.add(purple)
  
    const red = new THREE.Mesh(new THREE.SphereGeometry(.1, 32, 32), new THREE.MeshLambertMaterial({color: 0xab0000}))
    red.position.set(.2, .1, -1.29)
    group.add(red)
  
    const green = new THREE.Mesh(new THREE.SphereGeometry(.2, 32, 32), new THREE.MeshLambertMaterial({color: 0x009900}))
    green.position.set(1.6, .1, .8)
    group.add(green)
  
    const orange = new THREE.Mesh(new THREE.SphereGeometry(.4, 32, 32), new THREE.MeshLambertMaterial({color: 0xFFA500}))
    orange.position.set(-.6, .25, 1.8)
    group.add(orange)
  
    const pink = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 32), new THREE.MeshLambertMaterial({color: 0x9900cc}))
    pink.position.set(-2.6, .21, -3.2)
    group.add(pink)
  
    const yellow = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 32), new THREE.MeshLambertMaterial({color: 0xFFFF00}))
    yellow.position.set(2, .3, -2.8)
    group.add(yellow)
    
    const blue = new THREE.Mesh(new THREE.SphereGeometry(.25, 32, 32), new THREE.MeshLambertMaterial({color: 0x99ccff}))
    blue.position.set(2, 0, 3.5)
    group.add(blue)
    this.objects.push(purple, red, green, orange, pink, yellow, blue)
  }
  
  transformCamToPos = ( object ) => {
    this.controls.enabled = false
    
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    
    object.matrix.decompose( position, quaternion, scale )
    const aabb = new THREE.Box3().setFromObject(object)
    const center = aabb.getCenter(new THREE.Vector3())
    const size = aabb.getSize(new THREE.Vector3())
    
    gsap.to(this.camera.position, {
      duration: 1.5,
      x: position.x,
      y: position.y,
      z: center.z + size.z * 2,
      onUpdate: () => {
        this.camera.lookAt(center)
        this.camera.updateProjectionMatrix()
        this.controls.update()
      },
      onComplete: () => {}
    })
    gsap.to(this.controls.target, {
      duration: 1.5,
      x: position.x,
      y: position.y,
      z: position.z,
      onUpdate: () => {
        this.controls.update()
      },
      onComplete: () => {
        setTimeout(() => {
          this.resetCamera()
        }, 1000)
      }
    })
  }
  
  resetCamera = () => {
    const dummy = new THREE.Object3D()
    this.origin.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
    
    gsap.to(this.camera.position, {
      duration: 1,
      x: dummy.position.x,
      y: dummy.position.y,
      z: dummy.position.z,
      onUpdate: () => {
        this.camera.lookAt(0, 0, 0)
        this.camera.updateProjectionMatrix()
        this.controls.update()
      },
      onComplete: () => {},
    })
    gsap.to(this.controls.target, {
      duration: 1,
      x: 0,
      y: 0,
      z: 0,
      onUpdate: () => {
        this.controls.update()
      },
      onComplete: () => {
        this.controls.enabled = true
      }
    })
  }
  
  intersectHandler = () => {
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const intersects = this.raycaster.intersectObjects(this.objects)
    if (intersects.length > 0) {
      const INTERSECTED = intersects[0].object
      this.transformCamToPos(INTERSECTED)
    }
  }
  
  windowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.update();
  };
  
  onPointerMove = ( ev ) => {
    this.pointer.x = ( ev.clientX / window.innerWidth ) * 2 - 1;
    this.pointer.y = - ( ev.clientY / window.innerHeight ) * 2 + 1;
    
    this.intersectHandler()
  }
  
  update = () => {
    requestAnimationFrame(this.update)
    this.renderer.render(this.scene, this.camera);
  };
}

export { Transform }
