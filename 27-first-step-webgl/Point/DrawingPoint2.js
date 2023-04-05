
const vertexShader =
    `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = a_PointSize;
    }
    `
const fragmentShader =
    `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    `
const main = () => {
  const params = {
    x: 0,
    y: 0.5,
    z: 0,
    size: 5,
  }

  // 1.Retrieve canvas element
  const canvas = document.getElementById('webgl')

  // 2.Get the rendering context for webgl
  const gl = getWebGLContext(canvas)
  if(!gl) {
    console.error('Failed to get the rendering context for WebGL.')
    return
  }

  // 3.Init shaders
  if(!initShaders(gl, vertexShader, fragmentShader)) {
    console.error('Failed to initialize shaders.')
    return
  }

  //**************************************************************************//

  // 4.Get the storage location of attribute variable
  const position = gl.getAttribLocation(gl.program, 'a_Position')
  if(position < 0) {
    console.error('Failed to get the storage location of a_Position.')
    return
  }

  const size = gl.getAttribLocation(gl.program, 'a_PointSize')
  if(size < 0) {
    console.error('Failed to get the storage location of a_PointSize.')
    return
  }

  // 5.Pass vertex data to attribute variable
  gl.vertexAttrib3f(position, params.x, params.y, params.z)
  gl.vertexAttrib1f(size, params.size)

  //**************************************************************************//

  // 6.Specify the color for clearing canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // 7.Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 8.Draw a point
  gl.drawArrays(gl.POINTS, 0, 1)
}
