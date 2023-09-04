varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vNormal = normal;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition; // for 1 vertex
}
