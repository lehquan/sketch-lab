
varying vec3 vFragmentPos;
varying vec3 vNormal;
uniform vec3 uLightPos;

void main() {
    vec3 lightColor0 = vec3(1.0, 0.5, 0.5);
    vec3 translucencyColor = vec3(0.8, 0.2, 0.2);
    float lightIntensity0 = 0.2;

    vec3 toLightVector = uLightPos - vFragmentPos;

    // lightDistanceSQ: distance bw 1 vertex and light pos
    // This calculates light opacity relates to light pos
    // float lightDistanceSQ = dot(toLightVector, toLightVector);
    float lightDistanceSQ = pow(distance(vec3(0.), toLightVector), 2.0) ;

    vec3 lightDir = normalize(toLightVector);

    // calculate vertex direction and light direction
    float ndotl = max(0.0, dot(vNormal, lightDir)); // 0~1
    float inversendotl = step(0.0, dot(vNormal, -lightDir));

    // lightColor: light reflection in the top face
    vec3 lightColor = lightColor0.rgb * ndotl / lightDistanceSQ * lightIntensity0;

    // subsurfacecolor: light reflection inside object
    vec3 subsurfacecolor = translucencyColor.rgb * inversendotl / lightDistanceSQ * lightIntensity0;

    vec3 final = subsurfacecolor + lightColor;
    gl_FragColor = vec4(final, 1.);
}
