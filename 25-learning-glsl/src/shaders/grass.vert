uniform float uTime;
varying vec2 vUv;

#define PI 3.1415926538

void main() {
    vUv = uv;

    vec4 pos = vec4(position, 1.);
    #ifdef USE_INSTANCING
    pos = instanceMatrix * pos;
    #endif

    float topPower = 1. - cos(uv.y * PI);

    float wave = sin(pos.z + uTime * 10.) * .1 * topPower;
    pos.z += wave;

    vec4 mvPosition = modelViewMatrix * pos;
    gl_Position = projectionMatrix * mvPosition;
}
