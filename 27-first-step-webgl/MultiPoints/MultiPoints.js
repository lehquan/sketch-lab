const drawMultiPoints = () => {
  const vertexShader =
      `
      attribute vec4 aPosition;
      void main() {
        gl_Position = aPosition;
        gl_PointSize = 10.0;
      }
      `
  const fragmentShader =
      `
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
      `

  const gl = initContext(vertexShader, fragmentShader)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 4.Set positions of vertices
  const n = initVertexBuffers(gl)
  if (n<0) {
    console.error('Failed to set positions of the vertices.')
    return
  }

  // Draw 3 points
  draw(gl, 'POINT', n) // n is 3
}
const drawTriangle = () => {
  const vertexShader =
      `
      attribute vec4 aPosition;
      void main() {
        gl_Position = aPosition;
        gl_PointSize = 10.0;
      }
      `
  const fragmentShader =
      `
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
      `

  const gl = initContext(vertexShader, fragmentShader)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 4.Set positions of vertices
  const n = initVertexBuffers(gl)
  if (n<0) {
    console.error('Failed to set positions of the vertices.')
    return
  }

  // Draw 3 points
  draw(gl, 'TRIANGLE', n)
}

//***************************************************************************
const initContext = (vertexShader, fragmentShader) => {
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
    return;
  }

  return gl
}
const initVertexBuffers = gl => {
  const vertices = new Float32Array([
       0.0,  0.5,
      -0.5, -0.5,
       0.5, -0.5
  ])
  const n = 3 // The number of vertices

  // 5.Create a buffer object
  const vertexBuffer = gl.createBuffer()
  if(!vertexBuffer) {
    console.error('Failed to create a buffer object.')
    return -1
  }

  // 6.Bind buffer object to target, target is gl.ARRAY_BUFFER
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

  // 7.Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  // 8.Get the storage location of attribute variable
  const aPosition = gl.getAttribLocation(gl.program, 'aPosition')
  if(aPosition < 0) {
    console.error('Failed to get the storage location of aPosition.')
    return
  }

  // 9.Assign the buffer object to aPosition variable
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

  // 10.Enable the assignment to aPosition variable
  gl.enableVertexAttribArray(aPosition)

  return n
}
const draw = (gl, mode, n) => {
  // 4.Specify the color for clearing canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // 5.Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 6.Draw!
  switch (mode) {
    case 'POINT':
      gl.drawArrays(gl.POINTS, 0, n)
      break
    case 'TRIANGLE':
      gl.drawArrays(gl.TRIANGLES, 0, n)
      break
  }

}
