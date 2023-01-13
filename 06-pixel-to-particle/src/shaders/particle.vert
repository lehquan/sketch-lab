uniform float amplitude;
attribute vec3 color;
varying vec3 vColor;

void main() {
    vColor = color;

    vec4 pos = vec4(position, 1.0);
    pos.z *= amplitude;

    vec4 mvPosition = modelViewMatrix * pos;

    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * mvPosition;
}
