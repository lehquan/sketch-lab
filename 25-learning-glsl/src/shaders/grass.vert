uniform float uTime;
varying vec2 vUv;

#define PI 3.1415926538

void main() {
    vUv = uv;

    vec4 pos = vec4(position, 1.0);
    #ifdef USE_INSTANCING
    pos = instanceMatrix * pos;
    #endif

    // waving
    float tipPower = sin(vUv.y*0.5);
    float wave = sin(pos.z + uTime * 10.) * 0.1 * tipPower;
    pos.z += wave;

    vec4 mvPostion = modelViewMatrix * pos;
    gl_Position = projectionMatrix * mvPostion;
}
