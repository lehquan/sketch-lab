import * as THREE from 'three'
import Experience from '../Experience';

export default class Petal {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.np= 100
    this.interval = 16000;
    this.seeds=[]
    this.rotateSpeed = 5.
    this.wobbleSpeed = 300.
    this.wobbleMag = .05

    this.setPetal()
  }
  setPetal = () => {
    this.petal=new THREE.Mesh(new THREE.SphereGeometry(.05),new THREE.MeshStandardMaterial({color:'pink'}));

    this.pmesh = new THREE.InstancedMesh(this.petal.geometry,this.petal.material,this.np);
    // this.pmesh.add( new THREE.AxesHelper())
    this.pmesh.rotation.x = Math.PI/180*90
    this.pmesh.scale.multiplyScalar(1.)
    this.pmesh.position.y+=.5;
    this.petal.scale.z*=.1
    this.petal.scale.x*=.75

    this.scene.add(this.pmesh);

    for(let i=0;i<this.np;i++) {
      this.seeds[i] = Math.random();
    }
  }
  animate = (t,i) => {
    let seed=this.seeds[i]
    t = t+(this.seeds[i]*this.interval)
    t/=this.interval;

    //Wobble
    this.petal.position.x=(Math.sin(t+seed*6.)*Math.cos((t*seed)*.3*this.wobbleSpeed)*this.wobbleMag)
    this.petal.position.y=(Math.cos(t+seed*.5)*Math.sin((t*seed)*.67*this.wobbleSpeed)*this.wobbleMag)

    //Move constant speed on z...
    this.petal.position.z=((t%1)*3)-1.5;

    //Rotate
    this.petal.rotation.x=Math.sin((t+seed)*this.rotateSpeed)*16.2
    this.petal.rotation.y=Math.cos((t+seed*.76)*this.rotateSpeed)*16.2
    this.petal.rotation.z=Math.sin((t+seed*1.8)*this.rotateSpeed)*16.2

    // seeded random start offset
    this.petal.position.x+=Math.sin(seed*2164);
    this.petal.position.y+=Math.cos(seed*3123)*.1;
    this.petal.updateMatrix();
  }
  update = () => {
    for(let i=0; i<this.np; i++){
      this.animate(performance.now(), i);
      this.pmesh.setMatrixAt(i, this.petal.matrix);
    }
    this.pmesh.instanceMatrix.needsUpdate = true;
  }
}
