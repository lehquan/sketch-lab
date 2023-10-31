import Experience from '../Experience.js';
import Bvh from './Bvh';

export default class World {

	constructor() {

		this.experience = new Experience();
		this.scene = this.experience.scene;
		this.debug = this.experience.debug;
		this.resources = this.experience.resources;

		// Wait for resources
		this.resources.on( 'ready', () => {

			this.fox = new Bvh();

		} );

	}
	update() {

		if ( this.fox ) this.fox.update();

	}

}
