varying vec3 vNormal;
varying vec3 vPositionNormal;

void main() {

    // vNormal: normal of one vertex
    // normalMatrix: is computed by modelViewMatrix multiply to viewMatrix of camera
    vNormal = normalize( normalMatrix * normal );

    // transform a vertex into clip space
    vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);

    // position: local position of 1 vertex
    // modelViewMatrix: world object position from camera
    // mvPosition: world position of 1 vertex
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * mvPosition;
}
