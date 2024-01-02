varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
uniform vec3 uLight;

// Yuri's method
float getScatter(vec3 cameraPos, vec3 dir, vec3 lightPos, float d) {

    // light to ray origin
    vec3 q = cameraPos - lightPos;

    // coefficients
    float b = dot(dir, q);
    float c = dot(q, q);

    // evaluate integral
    float t = c - b * b;
    float s = 1./ sqrt(max(0.0001, t));
    float l = s * (atan((d+b) * s) - atan(b*s));

    return pow(max(0.,  l /150.), .4);
}

void main() {

    vec3 cameraToWorld = vWorldPosition - cameraPosition;
    vec3 cameraToWorldDirection = normalize(cameraToWorld);
    float cameraToWorldDistance = length(cameraToWorld);

    vec3 lightToWorld = normalize(uLight - vWorldPosition);
    float diffusion = max(0., dot(vNormal, lightToWorld));
    float dist = length(uLight - vPosition);

    float scatter = getScatter(cameraPosition, cameraToWorldDirection, uLight, cameraToWorldDistance);

    float final = diffusion * scatter;

    vec3 color = vec3(vUv, 0.0);
    gl_FragColor = vec4(scatter, 0., 0., 1.);
//    gl_FragColor = vec4(final, 0., 0., 1.);
}
