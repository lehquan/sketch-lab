
const vertexShader =
    `
    void main() {
      gl_Position = vec4(0., 0., 0., 1.);
      gl_PointSize = 10.;
    }
    `
const fragmentShader =
    `
    void main() {
      gl_FragColor = vec4(1., 0., 0., 1.);
    }
    `

function main() {
  // 1.Retrieve canvas element
  const canvas = document.getElementById('webgl')

  // 2.Get the rendering context for webgl
  const gl = getWebGLContext(canvas)
  if(!gl) {
    console.error('Failed to get the rendering context for WebGL.')
    return;
  }

  // 3.Init shaders
  if(!initShaders(gl, vertexShader, fragmentShader)) {
    console.error('Failed to initialize shaders.')
    return;
  }

  // 4.Specify the color for clearing canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // 5.Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 6.Draw a point
  gl.drawArrays(gl.POINTS, 0, 1)
}
