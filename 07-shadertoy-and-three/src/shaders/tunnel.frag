uniform float iTime;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

varying vec2 vUv;

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 p = -1.0 + 2.0 *vUv;
    vec2 q = p - vec2(0.5, 0.5);

    q.x += sin(iTime* 0.6) * 0.2;
    q.y += cos(iTime* 0.4) * 0.3;

    float len = length(q);

    float a = atan(q.y, q.x) + iTime * 0.3;
    float b = atan(q.y, q.x) + iTime * 0.3;
    float r1 = 0.3 / len + iTime * 0.5;
    float r2 = 0.2 / len + iTime * 0.5;

    float m = (1.0 + sin(iTime * 0.5)) / 2.0;
    vec4 tex1 = texture(iChannel0, vec2(a + 0.1 / len, r1 ));
    vec4 tex2 = texture(iChannel1, vec2(b + 0.1 / len, r2 ));
    vec3 col = vec3(mix(tex1, tex2, m));

    fragColor = vec4(col * len * 1.5, 1.0);
}

void main() {
    mainImage(gl_FragColor, vUv);
}
