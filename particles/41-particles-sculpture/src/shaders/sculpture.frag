uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vPosition;
varying float vNoise;

void main() {

//    float noise = snoise(vPosition.xy*20. + vec2(uTime/10.));
//    float noise = snoise(vPosition.xy*15. + vec2(uTime/10.));

    float dist = length(gl_PointCoord - vec2(.5));
    float disc = smoothstep(.5, .45, dist);

    gl_FragColor = vec4(vColor, disc*.5*vNoise);
//    gl_FragColor = vec4(vNormal, disc*.5*noise);
    if(disc < .001) discard;
}
