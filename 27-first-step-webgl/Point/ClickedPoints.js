
const vertexShader =
    `
    attribute vec4 a_Position;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = 10.0;
    }
    `
const fragmentShader =
    `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    `
let gl_points = [] // array for a mouse press

//**************************************************************************//
const main = () => {
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

  // 5.Register function to be called on a mouse press
  canvas.addEventListener('mousedown', ev => {
    click(ev, gl, canvas, position)
  })
}

const click = (ev, gl, canvas, position) => {
  let x = ev.clientX // x coordinate of a mouse pointer
  let y = ev.clientY // y coordinate of a mouse pointer
  const rect = ev.target.getBoundingClientRect()

  x = ((x-rect.left) - canvas.width/2) / (canvas.width/2)
  y = (canvas.height/2 - (y-rect.top)) / (canvas.height/2)

  // 6.Store the coordinates to array
  gl_points.push(x, y)

  // 7.Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT)

  for(let i =0; i<gl_points.length; i+=2){
    // 8.Pass position of a point to attribute variable
    gl.vertexAttrib3f(position, gl_points[i], gl_points[i+1], 0.0)

    // 9.Draw a point
    gl.drawArrays(gl.POINTS, 0, 1)
  }
}
