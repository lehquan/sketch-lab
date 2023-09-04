uniform float s;
uniform float b;
uniform float p;
uniform vec3 glowColor;

varying vec3 vNormal;
varying vec3 vPositionNormal;

void main() {
     float a = pow( b + s * abs(dot(vNormal, vPositionNormal)), p );
//    float a = pow(1.0 - abs(dot(vNormal, vPositionNormal)), 1.0 );

    gl_FragColor = vec4(glowColor, a);
}
