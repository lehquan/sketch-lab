
varying vec3 vFragmentPos;
varying vec3 vNormal;

void main() {

    // position: local position of 1 vertex
    // modelViewMatrix: world object position from camera
    // mvPosition: world position of 1 vertex
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    // modelMatrix: local object matrix
    vFragmentPos =  (modelMatrix * vec4( position, 1.0 )).xyz;
    vNormal =  (modelMatrix * vec4( normal, 0.0 )).xyz;

    gl_Position = projectionMatrix * mvPosition;// 1 vertex
}
