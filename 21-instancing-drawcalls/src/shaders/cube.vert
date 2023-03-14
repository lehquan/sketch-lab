precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
attribute vec3 cubePos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( cubePos + position, 1.0 );
}
