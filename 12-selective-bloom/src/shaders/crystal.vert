attribute vec3 position;
attribute float delay;
attribute float speed;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float time;
uniform float pixelRatio;
uniform float hex;

varying vec3 vColor;
varying float vOpacity;

const float duration = 3.0;

vec3 convertHsvToRgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

mat4 calcRotateMat4X(float radian) {
    return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, cos(radian), -sin(radian), 0.0,
    0.0, sin(radian), cos(radian), 0.0,
    0.0, 0.0, 0.0, 1.0
    );
}
mat4 calcRotateMat4Y(float radian) {
    return mat4(
    cos(radian), 0.0, sin(radian), 0.0,
    0.0, 1.0, 0.0, 0.0,
    -sin(radian), 0.0, cos(radian), 0.0,
    0.0, 0.0, 0.0, 1.0
    );
}
mat4 calcRotateMat4Z(float radian) {
    return mat4(
    cos(radian), -sin(radian), 0.0, 0.0,
    sin(radian), cos(radian), 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
    );
}
mat4 calcRotateMat4(vec3 radian) {
    return calcRotateMat4X(radian.x) * calcRotateMat4Y(radian.y) * calcRotateMat4Z(radian.z);
}

void main() {
    // calculate interval time from 0 to 1
    float interval = mod(time + delay * duration, duration) / duration;

    // update position and size
    float size = .7 * sin(interval * 1.0); // float size = 3.0 * sin(interval * 4.0);
    float blink = max(
    (sin(interval * 4.0) + cos(interval * 27.0) * 0.3 + cos(interval * 36.0) * 0.2) / 1.5 * 2.0 - 1.0,
    0.0
    );
    mat4 rotateMat = calcRotateMat4(vec3(
    radians(time * speed * 0.3),
    radians(time * speed),
    radians(time * speed * 0.3)
    ));

    // calculate colors
    vec3 hsv = vec3(hex, 0.6, 1.0);
    vec3 rgb = convertHsvToRgb(hsv);

    // coordinate transformation
    vec4 mvPosition = modelViewMatrix * rotateMat * vec4(position, 1.0);
    float distanceFromCamera = 35.0 / length(mvPosition.xyz);

    vColor = rgb;
    vOpacity = blink * clamp(distanceFromCamera, 0.5, 1.0);

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = distanceFromCamera * pixelRatio * size;
}
