uniform float uTime;
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
    float progress = fract(uTime / 4.0);

    vec4 frost = texture(uChannel1, uv);
    float icespread = texture(uChannel2, uv).r;

    vec2 rnd = vec2(rand(uv+frost.r*0.05), rand(uv+frost.b*0.05));

    float size = mix(progress, sqrt(progress), 0.5);
    size = size * 1.12 + 0.0000001; // just so 0.0 and 1.0 are fully (un)frozen and i'm lazy

    vec2 lens = vec2(size, pow(size, 4.0) / 2.0);
    float dist = distance(uv.xy, vec2(0.5, 0.5)); // the center of the froziness
    float vignette = pow(1.0-smoothstep(lens.x, lens.y, dist), 2.0);

    rnd *= frost.rg*vignette*FROSTYNESS;

    rnd *= 1.0 - floor(vignette); // optimization - brings rnd to 0.0 if it won't contribute to the image

    vec4 regular = texture(uChannel0, uv);
    vec4 frozen = texture(uChannel0, uv + rnd);
    frozen *= vec4(0.9, 0.9, 1.1, 1.0);

    gl_FragColor = mix(frozen, regular, smoothstep(icespread, 1.0, pow(vignette, 2.0)));
}
