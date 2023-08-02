uniform float uTime;
uniform vec3 uColor;
uniform vec3 uFrozenColor;
uniform sampler2D uChannel0;
uniform sampler2D uChannel1;
uniform sampler2D uChannel2;

varying vec2 vUv;

// Spreading Frost by dos
// Inspired by https://www.shadertoy.com/view/MsySzy by shadmar

#define FROSTYNESS 1.0
//#define RANDNERF 2.5

float rand(vec2 uv) {
    #ifdef RANDNERF
    uv = floor(uv*pow(10.0, RANDNERF))/pow(10.0, RANDNERF);
    #endif

    float a = dot(uv, vec2(92., 80.));
    float b = dot(uv, vec2(41., 62.));

    float x = sin(a) + cos(b) * 51.;
    return fract(x);
}

void main() {
    vec2 uv = vUv;
    float progress = fract(uTime / 10.0);

    vec4 frost = texture(uChannel1, uv);
    float icespread = texture(uChannel2, uv).r;

    vec2 rnd = vec2(rand(uv+frost.r*0.05), rand(uv+frost.b*0.05));

    float size = mix(progress, sqrt(progress), 0.5);
    //size = size * 1.12 + 0.0000001; // just so 0.0 and 1.0 are fully (un)frozen and i'm lazy

    vec2 lens = vec2(size, pow(size, 4.) / 2.);
    float dist = distance(uv.xy, vec2(1.0, 0.5)); // right side
    float vignette = pow(1. - smoothstep(lens.x, lens.y, dist), 1.);

    rnd *= frost.rg*vignette*FROSTYNESS;

    vec4 color = vec4(uColor, 0); // main color, opacity=0
//    vec4 frozen = texture(uChannel0, uv + rnd);
    vec4 frozen = vec4(uFrozenColor, rnd);
    frozen *= vec4(1, 1, 1, 1.0); // white color

    gl_FragColor = mix(frozen, color, smoothstep(icespread, 1.0, pow(vignette, 2.0)));
//    if ((gl_FragColor.a = length(gl_FragColor.rgb))<.1) discard;
}
