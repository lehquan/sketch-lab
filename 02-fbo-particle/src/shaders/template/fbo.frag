uniform float time;
uniform sampler2D positionTexture;
uniform vec4 resolution;
varying vec2 vUv;
varying vec2 vPosition;

void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}
