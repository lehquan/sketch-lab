
varying vec3 vFragmentPos;
varying vec3 vNormal;
uniform vec3 uLightPos;
uniform vec3 uTranslucencyColor;
uniform vec3 uLightColor;
uniform float uLightIntensity;

void main() {
    // vec3 uLightColor = vec3(1.0, 0.5, 0.5);
    // vec3 uTranslucencyColor = vec3(0.8, 0.2, 0.2);

    vec3 toLightVector = uLightPos - vFragmentPos;

    // lightDistanceSQ: distance bw 1 vertex and light pos
    // This calculates light opacity relates to light pos
    // float lightDistanceSQ = dot(toLightVector, toLightVector);
    float lightDistanceSQ = pow(distance(vec3(0.0), toLightVector), 1.5);

    vec3 lightDir = normalize(toLightVector);

    // calculate vertex direction and light direction
    float ndotl = max(0.0, dot(vNormal, lightDir)); // 0~1
    float inversendotl = step(0.0, dot(vNormal, -lightDir));

    // lightColor: light reflection in the top face
    vec3 lightColor = uLightColor.rgb * ndotl / lightDistanceSQ * uLightIntensity;

    // subsurfacecolor: light reflection inside object
    vec3 subsurfacecolor = uTranslucencyColor.rgb * inversendotl / lightDistanceSQ * uLightIntensity;

    vec3 final = subsurfacecolor + lightColor;
    gl_FragColor = vec4(final, 1.0);
}
