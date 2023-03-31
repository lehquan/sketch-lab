uniform vec3 uColor;
varying vec2 vUv;

void main() {

    float clarity = (vUv.y * 0.5) + 0.5;
    gl_FragColor = vec4(uColor * clarity, 1);
}
