
//varying vec2 vUv;
//
//void main() {
//    vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
//    gl_Position = projectionMatrix * mvPosition;
//
//    vUv = uv;
//}

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
