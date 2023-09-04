
varying vec2 vUv;
varying vec3 vColor;
varying vec3 vNormal;

void main() {

    vec3 light = vec3(0.0);
    vec3 skyColor = vec3(1.0, 1.0, 0.547);
    vec3 groundColor = vec3(0.562, 0.275, 0.111);

    vec3 lightDirection = normalize(vec3(0.0, -1.0, -1.0));

    light += dot(lightDirection, vNormal);

    light = mix(skyColor, groundColor, dot(lightDirection, vNormal));

    gl_FragColor = vec4(vColor, 1.0);
    gl_FragColor = vec4(light*vColor, 1.0);
}
