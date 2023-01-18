import * as THREE from 'three'
import Experience from '../Experience';

export default class Snow {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.resources = this.experience.resources

    this.vertices = []
    this.velocities = [];
    this.materials = [];
    this.count = 1000
    this.maxRange = 100;
    this.minRange = this.maxRange / 2;
    this.textureSize = 64.0;
    this.vertex = new THREE.Vector3();

    this.setSnow2()
  }
  setSnow2 = () => {
    const pointMaterial = new THREE.PointsMaterial({
      size: 1,
      color: 0xff2255,
      vertexColors: false,
      map: this.getTexture(),
      transparent: true,
      fog: true,
      depthWrite: false
    });

    //
    let pointGeometry = new THREE.BufferGeometry();
    for (let i = 0; i < this.count; i++) {
      const x = Math.floor(Math.random() * this.maxRange - this.minRange);
      const y = Math.floor(Math.random() * this.maxRange - this.minRange);
      const z = Math.floor(Math.random() * this.maxRange - this.minRange);

      this.vertices.push(x, y, z) // push number
    }
    for (let i = 0; i < this.count; i++) {
      const x = Math.floor(Math.random() * 6 - 3) * 0.1;
      const y = Math.floor(Math.random() * 10 + 3) * - 0.05;
      const z = Math.floor(Math.random() * 6 - 3) * 0.1;

      this.velocities.push(x, y, z);
    }

    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3))
    pointGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(this.velocities, 3))

    this.particles = new THREE.Points(pointGeometry, pointMaterial);
    this.scene.add(this.particles);
  }
  drawRadialGradation = (ctx, canvasRadius, canvasW, canvasH) => {
    ctx.save();
    const gradient = ctx.createRadialGradient(canvasRadius,canvasRadius,0,canvasRadius,canvasRadius,canvasRadius);
    gradient.addColorStop(0, 'rgba(255,255,255,1.0)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvasW,canvasH);
    ctx.restore();
  }
  getTexture = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const diameter = this.textureSize;
    canvas.width = diameter;
    canvas.height = diameter;
    const canvasRadius = diameter / 2;

    this.drawRadialGradation(ctx, canvasRadius, canvas.width, canvas.height);

    const texture = new THREE.Texture(canvas);
    texture.type = THREE.FloatType;
    texture.needsUpdate = true;

    return texture;
  }
  setSnow = () => {
    console.log(this.resources.items)

    const geometry = new THREE.BufferGeometry()
    for(let i=0; i< this.count; i++) {
      const x = Math.random() * 2000 - 1000
      const y = Math.random() * 2000 - 1000
      const z = Math.random() * 2000 - 1000

      this.vertices.push(x, y, z)
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3))

    this.parameters = [
      [[ 1.0, 0.2, 0.5 ], this.resources.items.snowflake2, 20 ],
      [[ 0.95, 0.1, 0.5 ], this.resources.items.snowflake3, 15 ],
      [[ 0.90, 0.05, 0.5 ], this.resources.items.snowflake1, 10 ],
      [[ 0.85, 0, 0.5 ], this.resources.items.snowflake5, 8 ],
      [[ 0.80, 0, 0.5 ], this.resources.items.snowflake4, 5 ]
    ];

    for(let i=0; i<this.parameters.length; i++) {

      const color = this.parameters[ i ][ 0 ];
      const sprite = this.parameters[ i ][ 1 ];
      const size = this.parameters[ i ][ 2 ];

      this.materials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
      this.materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );

      const particles = new THREE.Points(geometry, this.materials[i])
      particles.rotation.x = Math.random() * 6;
      particles.rotation.y = Math.random() * 6;
      particles.rotation.z = Math.random() * 6;

      this.scene.add(particles)
    }
  }
  update = () => {
    /*const time = Date.now() * 0.000001;
    for ( let i = 0; i < this.scene.children.length; i ++ ) {
      const object = this.scene.children[ i ];
      if ( object instanceof THREE.Points ) {
        object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
      }
    }*/

    // snow 2
    // let positionAttribute = this.particles.geometry.attributes.position;
    // for ( let i = 0; i < positionAttribute.count; i ++ ) {
    //   this.vertex.fromBufferAttribute( positionAttribute, i );
    //
    //   this.vertex.y -= 1;
    //   if (this.vertex.y < - 60) {
    //     this.vertex.y = 90;
    //   }
    //   positionAttribute.setXYZ( i, this.vertex.x, this.vertex.y, this.vertex.z );
    // }
    // positionAttribute.needsUpdate = true;

    let positionAttribute = this.particles.geometry.attributes.position; // n
    let velocityAttribute = this.particles.geometry.attributes.velocity.array; // n

    for ( let i = 0; i < positionAttribute.count; i ++ ) {
      this.vertex.fromBufferAttribute( positionAttribute, i ); // vertex
      const velocity = velocityAttribute[i]; // n

      this.vertex.y -= 1/20;
      if (this.vertex.y < - this.minRange) {
        this.vertex.y = this.minRange;
      }

      const velX = Math.sin(performance.now() * 0.001 * velocity) * 0.1;
      const velZ = Math.cos(performance.now() * 0.0015 * velocity) * 0.1;

      this.vertex.x += velX
      this.vertex.z += velZ

      positionAttribute.setXYZ( i, this.vertex.x, this.vertex.y, this.vertex.z ); // again setting attribute
    }
    positionAttribute.needsUpdate = true

  }
}
