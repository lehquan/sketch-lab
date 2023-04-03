uniform sampler2D tAudioData;
varying vec3 vColor;
varying vec2 vUv;

void main() {

     gl_FragColor = vec4(vColor, 1.0);

    if ((gl_FragColor.a = length(gl_FragColor.rgb))<.1) discard; // remove black pixel
    if(length(gl_PointCoord - 0.5) > 0.5) discard; // make 'em round
}
