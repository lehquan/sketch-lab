import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer'
import { SSRPass } from 'three/addons/postprocessing/SSRPass';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass';
import Experience from './Experience'
import {RenderPass} from 'three/addons/postprocessing/RenderPass';

export default class PostEffect {
  constructor() {
    this.experience = new Experience()
    this.renderer = this.experience.renderer.instance
    this.resources = this.experience.resources
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug

    this.params = {
      enableSSR: true,
      autoRotate: true,
      isOtherMeshes: true,
      isGroundReflector: true,
      isPerspectiveCamera: true,
      exposure: 1,
      bloomStrength: 2,
      bloomThreshold: 0,
      bloomRadius: 0.55
    }

    this.resources.on("ready", () => {
      this.groundReflector = this.experience.world.hallway.groundReflector
      this.selects = this.experience.world.hallway.selects
      this.otherMeshes = this.experience.world.hallway.otherMeshes

      this.setEffect()
    })

  }
  setEffect = () => {
    // const renderer = this.renderer
    // const scene = this.scene
    // const camera = this.camera

    this.composer = new EffectComposer(this.renderer)

    // ssr
    // this.ssrPass = new SSRPass( {
    //   renderer,
    //   scene,
    //   camera,
    //   width: innerWidth,
    //   height: innerHeight,
    //   encoding: THREE.sRGBEncoding,
    //   isPerspectiveCamera: this.params.isPerspectiveCamera,
    //   groundReflector: this.params.isGroundReflector ? this.groundReflector : null,
    //   selects: this.params.isGroundReflector ? this.selects : null
    // } );
    // this.composer.addPass(this.ssrPass)

    this.renderScene = new RenderPass(this.scene, this.camera);

    this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
    );
    this.bloomPass.threshold = this.params.bloomThreshold;
    this.bloomPass.strength = this.params.bloomStrength;
    this.bloomPass.radius = this.params.bloomRadius;

    this.composer.renderToScreen = false;
    this.composer.addPass(this.renderScene);
    this.composer.addPass(this.bloomPass);

    //
    if (this.debug.active) {
      this.debug.ui.add( this.params, 'enableSSR' ).name( 'Enable SSR' );
      this.debug.ui.add( this.params, 'isGroundReflector' ).onChange( () => {

        if ( this.params.isGroundReflector ) {

          this.ssrPass.groundReflector = this.groundReflector,
              this.ssrPass.selects = this.selects;

        } else {

          this.ssrPass.groundReflector = null,
              this.ssrPass.selects = null;

        }

      } );

      const folder = this.debug.ui.addFolder( 'more settings' );
      folder.add( this.ssrPass, 'fresnel' ).onChange( ()=>{

        this.groundReflector.fresnel = this.ssrPass.fresnel;

      } );
      folder.add( this.ssrPass, 'distanceAttenuation' ).onChange( ()=>{

        this.groundReflector.distanceAttenuation = this.ssrPass.distanceAttenuation;

      } );
      this.ssrPass.maxDistance = .1;
      // groundReflector.maxDistance = ssrPass.maxDistance;
      this.groundReflector.maxDistance = Infinity;
      folder.add( this.ssrPass, 'maxDistance' ).min( 0 ).max( .5 ).step( .001 ).onChange( ()=>{

        // groundReflector.maxDistance = ssrPass.maxDistance;

      } );
      folder.add( this.params, 'isOtherMeshes' ).onChange( () => {

        if ( this.params.isOtherMeshes ) {

          this.otherMeshes.forEach( mesh => mesh.visible = true );

        } else {

          this.otherMeshes.forEach( mesh => mesh.visible = false );

        }

      } );
      folder.add( this.ssrPass, 'bouncing' );
      folder.add( this.ssrPass, 'output', {
        'Default': SSRPass.OUTPUT.Default,
        'Beauty': SSRPass.OUTPUT.Beauty,
        'SSR Only': SSRPass.OUTPUT.SSR,
        'Depth': SSRPass.OUTPUT.Depth,
        'Normal': SSRPass.OUTPUT.Normal,
        'Metalness': SSRPass.OUTPUT.Metalness,
      } ).onChange( function ( value ) {

        this.ssrPass.output = parseInt( value );

      } );
      this.ssrPass.opacity = 1;
      this.groundReflector.opacity = this.ssrPass.opacity;
      folder.add( this.ssrPass, 'opacity' ).min( 0 ).max( 1 ).onChange( ()=>{

        this.groundReflector.opacity = this.ssrPass.opacity;

      } );
      if ( this.params.isPerspectiveCamera ) {

        this.ssrPass.surfDist = 0.0015;
        folder.add( this.ssrPass, 'surfDist' ).min( 0 ).max( .005 ).step( .0001 );

      } else {

        this.ssrPass.surfDist = 2;
        folder.add( this.ssrPass, 'surfDist' ).min( 0 ).max( 7 ).step( .01 );

      }
      folder.add( this.ssrPass, 'infiniteThick' );
      // folder.add( this.ssrPass, 'thickTolerance' ).min( 0 ).max( .05 ).step( .0001 );
      folder.add( this.ssrPass, 'blur' );
    }
  }
  resize = () => {
    // this.composer.setSize(this.sizes.width, this.sizes.height)
    // this.composer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
    // this.groundReflector.getRenderTarget().setSize( window.innerWidth, window.innerHeight );

    this.composer.setSize(this.sizes.width, this.sizes.height)
  }
  update = () => {
    if(this.composer) this.composer.render()
  }
}
