import Stats from 'three/addons/libs/stats.module';

export default class StatsUtil {

	constructor() {

		this.active = window.location.hash === '#debug';

		if ( this.active ) {

			this.activate();

		}

	}

	activate() {

		this.instance = new Stats();
		this.instance.showPanel( 0 );
		document.body.appendChild( this.instance.dom );

	}

	beforeRender() {

		this.instance.begin();

	}

	afterRender() {

		this.instance.end();

	}

}
