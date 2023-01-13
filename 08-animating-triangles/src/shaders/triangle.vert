uniform float uTime;
varying vec2 vUv;
varying vec2 vPosition;
attribute float aRandom;

void main() {
    vUv = uv;

    vec3 pos = position;
    pos += aRandom * (0.5*sin(uTime)+0.5) * normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.);
}
