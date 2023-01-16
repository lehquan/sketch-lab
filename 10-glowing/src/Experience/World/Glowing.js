import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler'
import Experience from '../Experience'
import vertexShader from '../../shaders/glowing.vert'
import fragmentShader from '../../shaders/glowing.frag'

export default class Glowing {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.params = {
      count: 2000,
      distribution: 'random',
      surfaceColor: 0xFFF784,
      backgroundColor: 0xE39469,
    };
    this.stemMesh = null
    this.blossomMesh = null
    this.sampler = null
    this.ages = new Float32Array( this.params.count );
    this.scales = new Float32Array( this.params.count );
    this.dummy = new THREE.Object3D();

    this._position = new THREE.Vector3();
    this._normal = new THREE.Vector3();
    this._scale = new THREE.Vector3();

    this.setMaterial()
    this.setSurface()
    this.setFlower()
    this.resample()
    this.addObjects()
  }
  setSurface = () => {
    const model = this.resources.items.skull.scene
    this.scene.add(model)

    model.traverse(child => {
      if (child.isMesh) {

        child.geometry = child.geometry.toNonIndexed()
        child.geometry.scale(30, 30, 30);
        child.geometry.translate(0, 2, 0);
        child.geometry.rotateY(Math.PI/180 * -90);

        // child.material.wireframe = true

        child.material = this.material
        this.surface = child
      }
    })
  }
  setFlower = () => {
    const flower = this.resources.items.flower.scene
    const _stemMesh = flower.getObjectByName( 'Stem' );
    const _blossomMesh = flower.getObjectByName( 'Blossom' );

    const stemGeometry = _stemMesh.geometry.clone();
    const blossomGeometry = _blossomMesh.geometry.clone();

    const defaultTransform = new THREE.Matrix4()
    .makeRotationX( Math.PI )
    .multiply( new THREE.Matrix4()
    .makeScale( 10, 10, 10 ) );

    stemGeometry.applyMatrix4( defaultTransform );
    blossomGeometry.applyMatrix4( defaultTransform );

    const stemMaterial = this.material // _stemMesh.material;
    const blossomMaterial = _blossomMesh.material;

    this.stemMesh = new THREE.InstancedMesh( stemGeometry, stemMaterial, this.params.count );
    this.blossomMesh = new THREE.InstancedMesh( blossomGeometry, blossomMaterial, this.params.count );

    // Assign random colors to the blossoms.
    const color = new THREE.Color();
    const blossomPalette = [ 0xF20587, 0xF2D479, 0xF2C879, 0xF2B077, 0xF24405 ];
    for ( let i = 0; i < this.params.count; i ++ ) {
      color.setHex( blossomPalette[ Math.floor( Math.random() * blossomPalette.length ) ] );
      this.blossomMesh.setColorAt( i, color );
    }

    // Instance matrices will be updated every frame.
    this.stemMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
    this.blossomMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );

    this.scene.add( this.stemMesh );
    this.scene.add( this.blossomMesh );
  }
  resample = () => {
    // const vertexCount = this.surface.geometry.getAttribute( 'position' ).count;
    // console.info( 'Sampling ' + this.params.count + ' points from a surface with ' + vertexCount + ' vertices...' );

    this.sampler = new MeshSurfaceSampler( this.surface )
    .setWeightAttribute( this.params.distribution === 'weighted' ? 'uv' : null )
    .build();

    for ( let i = 0; i < this.params.count; i ++ ) {

      this.ages[ i ] = Math.random();
      this.scales[ i ] = this.scaleCurve( this.ages[ i ] );

      this.resampleParticle( i );
    }
    this.stemMesh.instanceMatrix.needsUpdate = true;
    this.blossomMesh.instanceMatrix.needsUpdate = true;
  }
  resampleParticle = i => {
    this.sampler.sample( this._position, this._normal );
    this._normal.add( this._position );

    this.dummy.position.copy( this._position );
    this.dummy.scale.set( this.scales[ i ], this.scales[ i ], this.scales[ i ] );
    this.dummy.lookAt( this._normal );
    this.dummy.updateMatrix();

    this.stemMesh.setMatrixAt( i, this.dummy.matrix );
    this.blossomMesh.setMatrixAt( i, this.dummy.matrix );
  }
  updateParticle = i => {

    this.ages[ i ] += 0.005;

    if ( this.ages[ i ] >= 1 ) {

      this.ages[ i ] = 0.001;
      this.scales[ i ] = this.scaleCurve( this.ages[ i ] );

      this.resampleParticle( i );

      return;
    }

    // Update scale.
    const prevScale = this.scales[ i ];
    this.scales[ i ] = this.scaleCurve( this.ages[ i ] );
    this._scale.set( this.scales[ i ] / prevScale, this.scales[ i ] / prevScale, this.scales[ i ] / prevScale );

    // Update transform.
    this.stemMesh.getMatrixAt( i, this.dummy.matrix );
    this.dummy.matrix.scale( this._scale );
    this.stemMesh.setMatrixAt( i, this.dummy.matrix );
    this.blossomMesh.setMatrixAt( i, this.dummy.matrix );
  }
  setMaterial = () => {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        s: { value: -1.0},
        b: { value: 1.0},
        p: {  value: 1.0},
        glowColor: { value: new THREE.Color(0xff2255)},
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
    })
  }
  addObjects = () => {

    // torus
    this.torus = new THREE.Mesh(new THREE.TorusKnotGeometry( 1, .3, 100, 32 ),this.material )
    this.torus.rotation.y = Math.PI/180 * 30
    this.torus.position.set(-30, 20, 0)
    this.torus.scale.setScalar(4)
    this.torus.speed = Math.random() + THREE.MathUtils.randFloat(1000, 1500)
    this.scene.add( this.torus )

    // cone
    this.ico = new THREE.Mesh(
        new THREE.IcosahedronGeometry( 1, 0),
        this.material )
    this.ico.scale.setScalar(6)
    this.ico.position.x = 40
    this.ico.rotation.set(Math.PI/180*45, 0, 0)
    this.ico.speed = Math.random() + THREE.MathUtils.randFloat(1200, 2000)
    this.scene.add( this.ico );
  }
  easeOutCubic = function ( t ) {
    return ( -- t ) * t * t + 1;
  };
  scaleCurve = function ( t ) {
    return Math.abs( this.easeOutCubic( ( t > 0.5 ? 1 - t : t ) * 2 ) );
  };
  update = () => {
    if ( this.stemMesh && this.blossomMesh ) {

      for ( let i = 0; i < this.params.count; i ++ ) {
        this.updateParticle( i );
      }

      this.stemMesh.instanceMatrix.needsUpdate = true;
      this.blossomMesh.instanceMatrix.needsUpdate = true;
    }

    this.torus.position.y = THREE.MathUtils.lerp(this.torus.position.y, (2 + Math.sin(performance.now() / this.torus.speed)) * 10, 0.1)
    this.ico.position.y = THREE.MathUtils.lerp(this.ico.position.y, (1 + Math.sin(performance.now() / this.ico.speed)) * 8, 0.1)

    // this.ico.rotation.y = THREE.MathUtils.lerp(
    //     this.ico.rotation.y,
    //     (((-2 + Math.sin(performance.now() / this.ico.speed)) * Math.PI) / 180) * -120,
    //     0.5,
    // )
    // this.torus.rotation.z = THREE.MathUtils.lerp(
    //     this.torus.rotation.z,
    //     (((-2 + Math.sin(performance.now() / this.torus.speed)) * Math.PI) / 180) * -120,
    //     0.5,
    // )
  }
}
