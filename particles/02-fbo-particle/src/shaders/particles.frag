uniform float time;
uniform float progress;
uniform sampler2D texture;
uniform vec4 resolution;
varying vec2 vUv;
varying vec2 vPosition;
varying vec3 vColor;

void main() {
    //gl_FragColor = vec4(1., 1., 1., 0.4);

    // make point is circle
    float r = 0.;
    float delta = 0.;
    float alpha = 1.;

    vec2 cxy = 2. * gl_PointCoord - 1.;
    r = dot(cxy, cxy);
    delta = fwidth(r);
    alpha = 1. - smoothstep(1. - delta, 1. + delta, r);

    gl_FragColor = vec4(vColor, alpha);
}
