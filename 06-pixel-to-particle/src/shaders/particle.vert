uniform float[64] uDataArray;
uniform float uAmplitude;
uniform float uSize;
attribute vec3 color;
varying vec3 vColor;
varying vec2 vUv;

void main() {
    vColor = color;
    vUv = uv;

//    vec4 pos = vec4(position, 1.0);
//    pos.z *= uAmplitude;
//
//    vec4 mvPosition = modelViewMatrix * pos;
//
//    gl_PointSize = uSize;
//    gl_Position = projectionMatrix * mvPosition;

    vec4 pos = vec4(position, 1.0);
    pos.z = abs(position.z);

    float floor_z = round(pos.z);
//    pos.z = uDataArray[int(pos.z)] * uAmplitude;
    pos.z = sin(uDataArray[int(floor_z)] / 200.0 ) * uAmplitude;

    vec4 mvPosition = modelViewMatrix * pos;

    gl_PointSize = uSize;
    gl_Position = projectionMatrix * mvPosition;
}
