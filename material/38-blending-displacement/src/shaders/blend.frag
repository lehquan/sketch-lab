
uniform float uBlendFactor;
uniform float uDisplacementFactor;
uniform sampler2D uCurrent;
uniform sampler2D uNext;

varying vec2 vUv;

void main() {
    // invert blend;
    float blend2 = 1.0 - uBlendFactor; // = 0.5
    vec4 nextTexture = texture2D(uNext, vUv);
    vec4 currentTexture = texture2D(uCurrent, vUv);

    float t1 = ((currentTexture.r * uDisplacementFactor) * uBlendFactor) * 2.0;
    float t2 = ((nextTexture.r * uDisplacementFactor) * blend2) * 2.0;

    vec4 currentImage = texture2D(uCurrent, vec2(vUv.x, vUv.y-t1)) * blend2;
    vec4 nextImage = texture2D(uNext, vec2(vUv.x, vUv.y+t2)) * uBlendFactor;

//     gl_FragColor = currentImage.bbra * uBlendFactor + currentImage * blend2 + nextImage.bbra * blend2 + nextImage * uBlendFactor;
//    gl_FragColor = currentImage.rgba * uBlendFactor + currentImage * blend2 + nextImage.rgba * blend2 + nextImage * uBlendFactor;
    gl_FragColor = mix(currentImage, nextImage, uBlendFactor);
}
