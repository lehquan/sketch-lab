varying vec2 vUv;
varying float vProgress;

void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    float alpha = 1.0 - smoothstep(0.45, 0.5, dist);

    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha*0.5 + vProgress * 0.5);
}
