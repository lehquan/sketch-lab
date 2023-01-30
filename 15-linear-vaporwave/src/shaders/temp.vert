uniform float time;
varying vec2 vUv;
varying vec2 vPosition;
uniform sampler2D texture;

void main() {
    vUv = uv;
    vec4 mvPoisition = modelViewMatrix * vec4( position, 1.);
    gl_PointSize = 30. * ( 1. / -mvPoisition.z);
    gl_Position = projectionMatrix * mvPoisition;
}
