#include <common>
#include <fog_pars_vertex>

varying vec3 vPosition;
varying vec2 vScreenSpace;
varying vec3 vViewDiection;
varying vec3 vNormal;

void main() {
    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>

    vPosition = position;
    vNormal = normalize(mat3(modelMatrix)*normal);

    vec3 worldPosition = (modelMatrix * vec4( position, 1.)).xyz;
    vViewDiection = normalize(worldPosition - cameraPosition);

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.);

    // Get the screen coordinate to render the object
    // The color of object will stay the same position
    // when we zoom-in and out.
    vScreenSpace = gl_Position.xy/gl_Position.w;
}
