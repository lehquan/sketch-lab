#ifdef GL_ES
precision mediump float;
#endif

precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uVelocity;
uniform int uType;

varying vec2 vUv; // vertex uv

float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
    uv -= disc_center;
    uv*=uResolution;
    float dist = sqrt(dot(uv, uv));
    return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
}

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

float hash12(vec2 p) {
    float h = dot(p,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}

// #define HASHSCALE3 vec3(.1031, .1030, .0973)
vec2 hash2d(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}


void main() {
    /*vec2 newUV = vUv;

    float c = circle(vUv, uMouse, 0.0, 0.2);
    float r = texture2D(tDiffuse, newUV.xy += c * (0.1 * .5)).x;
    float g = texture2D(tDiffuse, newUV.xy += c * (0.1 * .525)).y;
    float b = texture2D(tDiffuse, newUV.xy += c * (0.1 * .55)).z;
    vec4 color = vec4(r, g, b, 1.);

    gl_FragColor = color;*/

    vec2 newUV = vUv;
    vec4 color = vec4(1.0, 0.0, 0.0, 1.0);

    // colorful
    if(uType==0){
        float c = circle(vUv, uMouse, 0.0, 0.2);
        float r = texture2D(tDiffuse, newUV.xy += c * (0.1 * .5)).x;
        float g = texture2D(tDiffuse, newUV.xy += c * (0.1 * .525)).y;
        float b = texture2D(tDiffuse, newUV.xy += c * (0.1 * .55)).z;
        color = vec4(r, g, b, 1.);
    }

    // zoom
    if(uType==1){
        float c = circle(newUV, uMouse, 0.0, 0.1+uVelocity*2.)*40.*uVelocity;
        vec2 offsetVector = normalize(uMouse - vUv);
        vec2 warpedUV = mix(vUv, uMouse, c * 0.99); //power
        color = texture2D(tDiffuse,warpedUV) + texture2D(tDiffuse,warpedUV)*vec4(vec3(c),1.);
    }

    // grain
    if(uType==2){
        float hash = hash12(vUv*10.);
        float c = circle(newUV, uMouse, 0.0, 0.1+uVelocity*0.01)*10.*uVelocity;
        vec2 offsetVector = normalize(uMouse - vUv);
        vec2 warpedUV = vUv + vec2(hash - 0.5)*c; //power
        color = texture2D(tDiffuse,warpedUV) + texture2D(tDiffuse,warpedUV)*vec4(vec3(c),1.);
    }

    gl_FragColor = color;
}
