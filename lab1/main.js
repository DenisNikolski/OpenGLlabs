var canvas = document.getElementById('tasks:1,2')

window.onload = drawAllTasks()

function updateTextInput(sidesNumb) {
  document.getElementById('textInput').value = sidesNumb
  drawTasks1and2()
}

function updateRadioButton() {
  drawAllTasks()
}

function drawAllTasks() {
  drawTasks1and2()
  drawTask3()
  drawTask4()
}

function drawTasks1and2() {
  var sidesNumb = document.getElementById('rangeInput').value
  var vertices = getVertices(sidesNumb)
  var drawMode = getDrawMode()
  drawLines(canvas, vertices, sidesNumb, drawMode)
}

function drawTask3() {
  var vertices = [
    -0.9, -0.5, 0.0,
    -0.6, 0.2, 0.0,
    -0.3, -0.5, 0.0,
    0.25, 0, 0.0,
    0.6, -0.45, 0.0,
    0.9, 0.2, 0.0
  ]
  sidesNumb = 1
  var drawMode = getDrawMode() // 'gl.TRIANGLE_STRIP'
  var canvas = document.getElementById('task3')
  drawLines(canvas, vertices, sidesNumb, drawMode)
}

function drawTask4() {
  var vertices = [
    -0.9, 0, 0.0,
    -0.4, 0.8, 0.0,
    0.3, 0.6, 0.0,
    0.5, 0.4, 0.0,
    0.55, -0.1, 0.0,
    0.3, -0.4, 0.0,
    -0.2, -0.6, 0.0
  ]
  sidesNumb = 1
  var drawMode = getDrawMode() // 'gl.LINE_LOOP'
  var canvas = document.getElementById('task4')
  drawLines(canvas, vertices, sidesNumb, drawMode)
}

function drawLines(canvas, vertices, sidesNumb, drawMode) {
  /* ================Creating a canvas================= */
  var gl = canvas.getContext('experimental-webgl')
  /* ==========Defining and storing the geometry======= */

  var numbVertices = (vertices.length / 3)
  // Create an empty buffer object to store the vertex buffer
  var vertexBuffer = getVertexBuffer(gl, vertices)

  /* =========================Shaders======================== */
  var vertShader = getVertexShader(gl)
  var fragShader = getfragShader(gl)
  // Create a shader program object to store the combined shader program
  var shaderProgram = getShaderProgram(gl, vertShader, fragShader)

  /* ======== Associating shaders to buffer objects ======== */
  associateShadersToBufferObjects(gl, vertexBuffer, shaderProgram)

  /* ============= Drawing the primitive =============== */
  draw(gl, canvas, numbVertices, drawMode)
}

function getVertices(sidesNumb) {
  var vertices = []
  var raduis = 0.5
  var angle
  for (var i = 0; i < sidesNumb; i++) {
    angle = i * 2 * Math.PI / sidesNumb
    vertices.push(raduis * Math.cos(angle))
    vertices.push(raduis * Math.sin(angle))
    vertices.push(0)
  }
  return vertices
}

function getDrawMode() {
  var drawMode = document.getElementsByName('drawMode')
  if (drawMode) {
    for (var i = 0; i < drawMode.length; i++) {
      if (drawMode[i].checked) {
        return drawMode[i].value
      }
    }
  }
}

function getVertexBuffer(gl, vertices) {
  var vertexBuffer = gl.createBuffer()

  // Bind appropriate array buffer to it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  // Pass the vertex data to the buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  return vertexBuffer
}

function getVertexShader(gl) {
  // vertex shader source code
  var vertCode =
    'attribute vec3 coordinates;' +
    'void main(void) {' +
    ' gl_Position = vec4(coordinates, 1.0);' +
    'gl_PointSize = 6.0;' +
    '}'
  // Create a vertex shader object
  var vertShader = gl.createShader(gl.VERTEX_SHADER)
  // Attach vertex shader source code
  gl.shaderSource(vertShader, vertCode)
  // Compile the vertex shader
  gl.compileShader(vertShader)
  return vertShader
}

function getfragShader(gl) {
  // fragment shader source code
  var fragCode =
    'void main(void) {' +
    ' gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);' +
    '}'
  // Create fragment shader object
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER)
  // Attach fragment shader source code
  gl.shaderSource(fragShader, fragCode)
  // Compile the fragmentt shader
  gl.compileShader(fragShader)
  return fragShader
}

function associateShadersToBufferObjects(gl, vertexBuffer, shaderProgram) {
  // Bind vertex buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  // Get the attribute location
  var coord = gl.getAttribLocation(shaderProgram, 'coordinates')
  // Point an attribute to the currently bound VBO
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0)
  // Enable the attribute
  gl.enableVertexAttribArray(coord)
}

function getShaderProgram(gl, vertShader, fragShader) {
  var shaderProgram = gl.createProgram()
  // Attach a vertex shader
  gl.attachShader(shaderProgram, vertShader)
  // Attach a fragment shader
  gl.attachShader(shaderProgram, fragShader)
  // Link both programs
  gl.linkProgram(shaderProgram)
  // Use the combined shader program object
  gl.useProgram(shaderProgram)
  return shaderProgram
}

function draw(gl, canvas, numbVertices, drawMode) {
  // Clear the canvas
  gl.clearColor(0.5, 0.5, 0.5, 0.9)
  // Enable the depth test
  gl.enable(gl.DEPTH_TEST)
  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT)
  // Set the view port
  gl.viewport(0, 0, canvas.width, canvas.height)

  switch (drawMode) {
  case 'gl.POINTS':
    gl.drawArrays(gl.POINTS, 0, numbVertices)
    break
  case 'gl.LINE_STRIP':
    gl.drawArrays(gl.LINE_STRIP, 0, numbVertices)
    break
  case 'gl.LINES':
    gl.drawArrays(gl.LINES, 0, numbVertices)
    break
  case 'gl.TRIANGLE_STRIP':
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, numbVertices)
    break
  case 'gl.TRIANGLES':
    gl.drawArrays(gl.TRIANGLES, 0, numbVertices)
    break
  case 'gl.LINE_LOOP':
    gl.drawArrays(gl.LINE_LOOP, 0, numbVertices)
    break
  case 'gl.TRIANGLE_FAN':
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numbVertices)
    break
  default:
    gl.drawArrays(gl.POINTS, 0, numbVertices)
  }
}