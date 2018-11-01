const canvas = document.getElementById('tasks:1,2');

window.onload = void drawAllTasks();

function updateTextInput(sidesNumb) {
    document.getElementById('textInput').value = sidesNumb;
    drawTasks1and2()
}

function updateDrawModeRadioButton() {
    drawAllTasks()
}

function updateCullFace() {
    drawAllTasks()
}

function drawAllTasks() {
    drawTasks1and2();
    drawTask3();
    drawTask4();
    drawTask7();
}

function drawTasks1and2() {
    const sidesNumb = document.getElementById('rangeInput').value;
    const vertices = getVertices(sidesNumb);
    drawLines(canvas, vertices, sidesNumb)
}

function drawTask3() {
    const vertices = [
        -0.9, -0.5, 0.0,
        -0.6, 0.2, 0.0,
        -0.3, -0.5, 0.0,
        0.25, 0, 0.0,
        0.6, -0.45, 0.0,
        0.9, 0.2, 0.0
    ];
    let sidesNumb = 1;
    const canvas = document.getElementById('task3');
    drawLines(canvas, vertices, sidesNumb)
}

function drawTask4() {
    const vertices = [
        -0.9, 0, 0.0,
        -0.4, 0.8, 0.0,
        0.3, 0.6, 0.0,
        0.5, 0.4, 0.0,
        0.55, -0.1, 0.0,
        0.3, -0.4, 0.0,
        -0.2, -0.6, 0.0
    ];
    let sidesNumb = 1;

    const canvas = document.getElementById('task4');
    drawLines(canvas, vertices, sidesNumb)
}

function drawTask7() {
    const vertices = [
        -0.9, -0.4, 0.0,
        -0.6, 0.8, 0.0,
        0.1, 0.6, 0.0,
        0.4, 0.1, 0.0,
        0.7, 0.7, 0.0,
        0.9, -0.3, 0.0,
        0.6, -0.6, 0.0
    ];
    let sidesNumb = 1;
    const canvas = document.getElementById('task7');
    drawLines(canvas, vertices, sidesNumb)
}

function drawLines(canvas, vertices, sidesNumb) {
    /* ================Creating a canvas================= */
    const gl = canvas.getContext('experimental-webgl');
    /* ==========Defining and storing the geometry======= */

    const numbVertices = (vertices.length / 3);
    // Create an empty buffer object to store the vertex buffer
    const vertexBuffer = initVertexBuffer(gl, vertices);
    const colorBuffer = initColorBuffer(gl, sidesNumb);
    /* =========================Shaders======================== */
    const vertShader = initVertexShader(gl);
    const fragShader = initfragShader(gl);
    // Create a shader program object to store the combined shader program
    const shaderProgram = initShaderProgram(gl, vertShader, fragShader);

    /* ======== Associating shaders to buffer objects ======== */
    associateShadersToBufferObjects(gl, vertexBuffer, colorBuffer, shaderProgram);

    /* ============= Drawing the primitive =============== */
    draw(gl, canvas, numbVertices)
}

function getVertices(sidesNumb) {
    const vertices = [];
    const radius = 0.5;
    let angle;
    for (let i = 0; i < sidesNumb; i++) {
        angle = i * 2 * Math.PI / sidesNumb;
        vertices.push(radius * Math.cos(angle));
        vertices.push(radius * Math.sin(angle));
        vertices.push(0);


    }
    return vertices
}

function getDrawMode() {
    const drawMode = document.getElementsByName('drawMode');
    if (drawMode) {
        for (let i = 0; i < drawMode.length; i++) {
            if (drawMode[i].checked) {
                return drawMode[i].value
            }
        }
    }
}

function getCullFaceMode() {
    const cullMode = document.getElementsByName('cullFace');
    if (cullMode) {
        for (let i = 0; i < cullMode.length; i++) {
            if (cullMode[i].checked) {
                return cullMode[i].value
            }
        }
    }
}

function initVertexBuffer(gl, vertices) {
    const vertexBuffer = gl.createBuffer();

    // Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vertexBuffer
}

function initVertexShader(gl) {
    // vertex shader source code
    const vertCode = `
    attribute vec3 coordinates;
    attribute vec4 aVertexColor;

    varying lowp vec4 vColor;

    void main(void) {
    gl_Position = vec4(coordinates, 1.0);
    gl_PointSize = 6.0;
    vColor = aVertexColor;
  } `;
    // Create a vertex shader object
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    // Attach vertex shader source code
    gl.shaderSource(vertShader, vertCode);
    // Compile the vertex shader
    gl.compileShader(vertShader);

    return vertShader
}

function initfragShader(gl) {
    // fragment shader source code
    const fragCode = `
  varying lowp vec4 vColor;

  void main(void) {
     gl_FragColor = vColor;
   }`;
    // Create fragment shader object
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    // Attach fragment shader source code
    gl.shaderSource(fragShader, fragCode);
    // Compile the fragment shader
    gl.compileShader(fragShader);

    return fragShader
}

function initShaderProgram(gl, vertShader, fragShader) {
    const shaderProgram = gl.createProgram();
    // Attach a vertex shader
    gl.attachShader(shaderProgram, vertShader);
    // Attach a fragment shader
    gl.attachShader(shaderProgram, fragShader);
    // Link both programs
    gl.linkProgram(shaderProgram);
    // Use the combined shader program object
    gl.useProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram
}

function initColorBuffer(gl, sidesNumb) {

    const colors = getColorArray(sidesNumb);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return colorBuffer;
}

function getColorArray(sidesNumb) {
    const colorsArray = [];
    const baseColors = [
        1.0, 1.0, 1.0, 1.0, // white
        1.0, 0.0, 0.0, 1.0, // red
        0.0, 1.0, 0.0, 1.0, // green
        0.0, 0.0, 1.0, 1.0, // blue
    ];

    if (sidesNumb < 7) {
        sidesNumb = 7
    }

    for (let i = 0; i < sidesNumb; i = i + 4) {
        colorsArray.push(...baseColors)
    }

    return colorsArray
}

function associateShadersToBufferObjects(gl, vertexBuffer, colorBuffer, shaderProgram) {
    let numComponents = 3;
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Get the attribute location
    const coord = gl.getAttribLocation(shaderProgram, 'coordinates');
    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coord, numComponents, type, normalize, stride, offset);
    // Enable the attribute
    gl.enableVertexAttribArray(coord);

    // color
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    const colors = gl.getAttribLocation(shaderProgram, 'aVertexColor');
    numComponents = 4;
    gl.vertexAttribPointer(colors, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(colors)
}

function draw(gl, canvas, numbVertices) {
    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // Clear the color buffer bit
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Set the view port
    gl.viewport(0, 0, canvas.width, canvas.height);

    let isCullFaceEnable = document.getElementById('isCullFaceEnable').checked;
    if (isCullFaceEnable) {
        gl.enable(gl.CULL_FACE);

        switch (getCullFaceMode()) {
            case 'gl.FRONT':
                gl.cullFace(gl.FRONT);
                break;
            case 'gl.BACK':
                gl.cullFace(gl.BACK);
                break;
            case 'gl.FRONT_AND_BACK':
                gl.cullFace(gl.FRONT_AND_BACK);
                break;
            default:
                gl.cullFace(gl.FRONT);
        }
    } else {
        gl.disable(gl.CULL_FACE);
    }

    switch (getDrawMode()) {
        case 'gl.POINTS':
            gl.drawArrays(gl.POINTS, 0, numbVertices);
            break;
        case 'gl.LINE_STRIP':
            gl.drawArrays(gl.LINE_STRIP, 0, numbVertices);
            break;
        case 'gl.LINES':
            gl.drawArrays(gl.LINES, 0, numbVertices);
            break;
        case 'gl.TRIANGLE_STRIP':
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, numbVertices);
            break;
        case 'gl.TRIANGLES':
            gl.drawArrays(gl.TRIANGLES, 0, numbVertices);
            break;
        case 'gl.LINE_LOOP':
            gl.drawArrays(gl.LINE_LOOP, 0, numbVertices);
            break;
        case 'gl.TRIANGLE_FAN':
            gl.drawArrays(gl.TRIANGLE_FAN, 0, numbVertices);
            break;
        default:
            gl.drawArrays(gl.POINTS, 0, numbVertices)
    }
}
