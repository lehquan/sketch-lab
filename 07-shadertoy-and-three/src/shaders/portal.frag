//Noise animation - Electric
//by nimitz (stormoid.com) (twitter: @stormoid)
//modified to look like a portal by Pleh
//fbm tweaks by foxes

//The domain is displaced by two fbm calls one for each axis.
//Turbulent fbm (aka ridged) is used for better effect.

#define time iTime*0.15
#define tau 6.2831853

uniform sampler2D iChannel0;
uniform vec2 iResolution;
uniform float iTime;

varying vec2 vUv;

mat2 makem2(in float theta){ float c = cos(theta);float s = sin(theta);return mat2(c, -s, s, c); }
float noise(in vec2 x){ return texture(iChannel0, x*.01).x; }

float fbm(in vec2 p) {
    vec4 tt=fract(vec4(time*2.)+vec4(0.0, 0.25, 0.5, 0.75));
    vec2 p1=p-normalize(p)*tt.x;
    vec2 p2=vec2(1.0)+p-normalize(p)*tt.y;
    vec2 p3=vec2(2.0)+p-normalize(p)*tt.z;
    vec2 p4=vec2(3.0)+p-normalize(p)*tt.w;
    vec4 tr=vec4(1.0)-abs(tt-vec4(0.5))*2.0;//*vec4(0.0,1.0,0.0,1.0);
    float z=2.;
    vec4 rz = vec4(0.);
    for (float i= 1.;i < 4.;i++)
    {
        rz+= abs((vec4(noise(p1), noise(p2), noise(p3), noise(p4))-vec4(0.5))*2.)/z;
        z = z*2.;
        p1 = p1*2.;
        p2 = p2*2.;
        p3 = p3*2.;
        p4 = p4*2.;
    }
    return dot(rz, tr)*0.25;
}
float dualfbm(in vec2 p) {
    //get two rotated fbm calls and displace the domain
    vec2 p2 = p*.7;
    vec2 basis = vec2(fbm(p2-time*1.6), fbm(p2+time*1.7));
    basis = (basis-.5)*.2;
    p += basis;

    //coloring
    return fbm(p);//*makem2(time*2.0));
}

float circ(vec2 p) {
    float r = length(p);
    r = log(sqrt(r));
    return abs(mod(r*2., tau)-4.54)*3.+.5;

}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    //setup system
    vec2 p = fragCoord.xy / iResolution.xy-0.5;
    p.x *= iResolution.x/iResolution.y;
    p*=4.;

    float rz = dualfbm(p);
//            float rz = dualfbm(p)-dualfbm(p*2.);

    //rings
//        p /= 7.0; //exp(mod(time*10.,3.14159));
//        rz *= pow(abs((0.0-circ(p))),.99);

    // elipse
    /*rz *= abs((-circ(vec2(p.x / 4.2, p.y / 7.0))));
    rz *= abs((-circ(vec2(p.x / 4.2, p.y / 7.0))));
    rz *= abs((-circ(vec2(p.x / 4.2, p.y / 7.0))));*/

    // circle
    rz *= abs((-circ(vec2(p.x / 6.2, p.y / 6.0))));
    rz *= abs((-circ(vec2(p.x / 6.2, p.y / 6.0))));
    rz *= abs((-circ(vec2(p.x / 6.2, p.y / 6.0))));

    // final color: blue
    vec3 col = vec3(.1, 0.1, 0.4)/rz;
    col=pow(abs(col), vec3(.99));
    fragColor = vec4(col, 1.);

    fragColor.rgb *= 1.-smoothstep(.4, .5, length((fragCoord.xy/iResolution.xy)-.5));
    if ((fragColor.a = length(fragColor.rgb))<.1) discard;
}

void main() {
    mainImage(gl_FragColor, vUv);
//        mainImage(gl_FragColor, ((vUv-.5)*2.)+.5); // scalling vUv to remove transparent edges
}
