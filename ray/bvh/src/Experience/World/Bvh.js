import {
	AnimationMixer,
	Clock,
	MeshBasicMaterial,
	TorusKnotGeometry, Mesh, BufferGeometry, DoubleSide, Raycaster, Vector2,
} from 'three';
import Experience from "../Experience.js";
import { EVT } from '../../utils/contains';
import {
	acceleratedRaycast,
	computeBoundsTree,
	disposeBoundsTree, MeshBVHVisualizer,
} from 'three-mesh-bvh';
import Ray from '../Ray';

export default class Bvh {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
		this.camera = this.experience.camera.instance
    this.debug = this.experience.debug

		this.raycaster = new Raycaster()
		this.raycaster.firstHitOnly = true
		this.pointer = new Vector2()

		this.params = {
			count: 150,
			firstHitOnly: true,
			useBVH: true,

			displayHelper: true,
			helperDepth: 10,
		};

		this.init()
		// window.addEventListener(EVT.RAY_INTERSECTED, this.onIntersected, false)
		window.addEventListener('click', ev => {
			this.onClickHandler(ev)
		})
  }
	init = () => {
		// Add the extension functions
		BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
		BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
		Mesh.prototype.raycast = acceleratedRaycast;

		this.addObject()
		this.setDebug()
	}
	setDebug = () => {
		if(!this.debug.active) return;

		this.debug.ui.add( this.params, 'useBVH' ).onChange( val => {
			this.mesh.geometry.boundsTree = val ? this.bvh : null;
		} );

	}
	onClickHandler = ev => {
		this.pointer.x = ( ev.clientX / window.innerWidth ) * 2 - 1
		this.pointer.y = - ( ev.clientY / window.innerHeight ) * 2 + 1

		// this.raycaster.setFromCamera(this.pointer, this.camera)
		// const intersects = this.raycaster.intersectObjects([this.mesh])
		// console.log(intersects)
	}
	addObject = () => {
		// glb
    const model = this.resources.items.neko.scene
    this.scene.add(model)

		model.traverse(child => {
			if (child.isMesh) {
        child.geometry.computeBoundsTree();

				const helper = new MeshBVHVisualizer( child )
				helper.depth = this.params.helperDepth;
				helper.color.set( 0xE91E63 );
				helper.visible = this.params.displayHelper;
				this.scene.add( helper )
      }
		})

		// torus
		/*let mul = 8
		const geometry = new TorusKnotGeometry( 10, 3, 100 * mul, 16 * mul)
		const material = new MeshBasicMaterial({ color: 0xffff00 })
		this.mesh = new Mesh( geometry, material );
		this.mesh.name = 'quan'
		geometry.computeBoundsTree();
		this.bvh = geometry.boundsTree;

		if ( !this.params.useBVH ) {
			geometry.boundsTree = null;
		}

		this.scene.add( this.mesh );

		this.helper = new MeshBVHVisualizer(this.mesh )
		this.helper.depth = this.params.helperDepth;
		this.helper.color.set( 0xE91E63 );
		this.helper.visible = this.params.displayHelper;
		this.scene.add( this.helper );*/
  }
	onIntersected = ev => {
		this.INTERSECTED = ev.detail
		console.log(this.INTERSECTED.name)
	}
  update() {

  }
}
