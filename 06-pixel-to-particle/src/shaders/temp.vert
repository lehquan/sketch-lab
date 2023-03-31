varying vec2 vUv;

void main() {
    vUv = uv;

    // position: local position of 1 vertex
    // modelViewMatrix: object's world position from camera
    // mvPosition: world position of 1 vertex
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * mvPosition; // for 1 vertex
}
