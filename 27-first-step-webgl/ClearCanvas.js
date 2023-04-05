
function main() {
  // 1.Retrieve canvas element
  const canvas = document.getElementById('webgl')

  // 2.Get the rendering context for webgl
  const gl = getWebGLContext(canvas)
  if(!gl) {
    console.error('Failed to get the rendering context for WebGL.')
    return false
  }

  // 3.Specify the color for clearing canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // 4.Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT)

}
