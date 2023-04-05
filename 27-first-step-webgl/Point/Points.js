const drawOnePoint = () => {
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

  const gl = initContext(vertexShader, fragmentShader)
  gl.clear(gl.COLOR_BUFFER_BIT)

  //
  draw(gl, 'POINT')
}
const drawOnePointWithAttr = () => {
  const vertexShader =
      `
    attribute vec4 aPosition;
    attribute float aSize;
    void main() {
      gl_Position = aPosition;
      gl_PointSize = aSize;
    }
    `
  const fragmentShader =
      `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    `
  const params = {
    x: 0,
    y: 0.5,
    z: 0,
    size: 5,
  }

  const gl = initContext(vertexShader, fragmentShader)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 4.Get the storage location of attribute variable
  const position = gl.getAttribLocation(gl.program, 'aPosition')
  if(position < 0) {
    console.error('Failed to get the storage location of aPosition.')
    return
  }

  const size = gl.getAttribLocation(gl.program, 'aSize')
  if(size < 0) {
    console.error('Failed to get the storage location of aSize.')
    return
  }

  // 5.Pass vertex data to attribute variable
  gl.vertexAttrib3f(position, params.x, params.y, params.z)
  gl.vertexAttrib1f(size, params.size)

  //
  draw(gl, 'POINT')
}
const drawClickedPoint = () => {
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
  const canvas = document.getElementById('webgl')
  const gl = initContext(vertexShader, fragmentShader)
  let gl_points = [] // array for a mouse press
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 4.Get the storage location of attribute variable
  const aPosition = gl.getAttribLocation(gl.program, 'aPosition')
  if(aPosition < 0) {
    console.error('Failed to get the storage location of aPosition.')
    return
  }

  // 5.Register function to be called on a mouse press
  canvas.addEventListener('mousedown', ev => {
    click(ev, gl, canvas, aPosition, gl_points)
  })
}
const drawColoredPoint = () => {
  const VERT =
      `
      attribute vec4 aPosition;
      void main() {
        gl_Position = aPosition;
        gl_PointSize = 10.0;
      }
      `
  const FRAG =
      `
      precision mediump float;
      uniform vec4 uColor;
      void main() {
        gl_FragColor = uColor;
      }
      `
  const canvas = document.getElementById('webgl')
  const gl = initContext(VERT, FRAG)
  gl.clear(gl.COLOR_BUFFER_BIT)
  let gl_points = [] // array for a mouse press
  let gl_colors = [] // array to store color of a point

  // 4.Get the storage location of attribute variable
  const aPosition = gl.getAttribLocation(gl.program, 'aPosition')
  if(aPosition < 0) {
    console.error('Failed to get the storage location of aPosition.')
    return
  }

  const uColor = gl.getUniformLocation(gl.program, 'uColor')
  if(uColor < 0) {
    console.error('Failed to get the storage location of uColor.')
    return
  }

  // 5.Register function to be called on a mouse press
  canvas.addEventListener('mousedown', ev => {
    clickWithColor(ev, gl, canvas, aPosition, uColor, gl_points, gl_colors)
  })
}
const click = (ev, gl, canvas, aPosition, gl_points) => {
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
    gl.vertexAttrib3f(aPosition, gl_points[i], gl_points[i+1], 0.0)

    // 9.Draw a point
    gl.drawArrays(gl.POINTS, 0, 1)
  }
}
const clickWithColor = (ev, gl, canvas, aPosition, uColor, gl_points, gl_colors) => {
  let x = ev.clientX // x coordinate of a mouse pointer
  let y = ev.clientY // y coordinate of a mouse pointer
  const rect = ev.target.getBoundingClientRect()

  x = ((x-rect.left) - canvas.width/2) / (canvas.width/2)
  y = (canvas.height/2 - (y-rect.top)) / (canvas.height/2)

  // 6.Store the coordinates to array
  gl_points.push([x, y])

  // Store the color to g_colors array
  if(x >= 0.0 && y >= 0.0) {
    gl_colors.push([1.0, 0.0, 0.0, 1.0]) // red
  }
  else if (x < 0.0 && y < 0.0) {
    gl_colors.push([0.0, 1.0, 0.0, 1.0]) // green
  }
  else {
    gl_colors.push([1.0, 1.0, 1.0, 1.0]) // white
  }

  // 7.Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT)

  for(let i =0; i<gl_points.length; i++){
    const pos = gl_points[i]
    const c = gl_colors[i]

    // 8.Pass position of a point to attribute variable
    gl.vertexAttrib3f(aPosition, pos[0], pos[1], 0.0)
    // 9.Pass the color of a point to color variable
    gl.uniform4f(uColor, c[0], c[1], c[2], c[3])

    // 10.Draw a point
    gl.drawArrays(gl.POINTS, 0, 1)
  }
}
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
const draw = (gl, mode) => {
  // 4.Specify the color for clearing canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // 5.Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 6.Draw!
  switch (mode) {
    case 'POINT':
      gl.drawArrays(gl.POINTS, 0, 1)
      break
  }

}
