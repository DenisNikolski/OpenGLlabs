// WebGL - Textures - Wrap Modes
// from https://webglfundamentals.org/webgl/webgl-3d-textures-repeat-clamp.html

"use strict";

const zDepth = 50;

function main() {
    // Get A WebGL context
    const canvas = document.getElementById("canvas", {antialias: false});
    let gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // setup GLSL program
    const program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);

    // look up where the vertex data needs to go.
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

    // lookup uniforms
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");
    const textureLocation = gl.getUniformLocation(program, "u_texture");

    // Create a buffer for positions
    const positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put the positions in the buffer
    setGeometry(gl);

    // provide texture coordinates for the rectangle.
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    // Set Texcoords.
    setTexcoords(gl);

    // Create a texture.
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));
    // Asynchronously load an image
    const image = new Image();
    image.src = "wood.png";
    image.addEventListener('load', function () {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Check if the image is a power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        drawScene();
    });

    let wrapS = gl.REPEAT;
    let wrapT = gl.REPEAT;

    document.querySelector("#wrap_s0").addEventListener('click', function () {
        wrapS = gl.REPEAT;
        drawScene();
    });  // eslint-disable-line
    document.querySelector("#wrap_s1").addEventListener('click', function () {
        wrapS = gl.CLAMP_TO_EDGE;
        drawScene();
    });  // eslint-disable-line
    document.querySelector("#wrap_s2").addEventListener('click', function () {
        wrapS = gl.MIRRORED_REPEAT;
        drawScene();
    });  // eslint-disable-line
    document.querySelector("#wrap_t0").addEventListener('click', function () {
        wrapT = gl.REPEAT;
        drawScene();
    });  // eslint-disable-line
    document.querySelector("#wrap_t1").addEventListener('click', function () {
        wrapT = gl.CLAMP_TO_EDGE;
        drawScene();
    });  // eslint-disable-line
    document.querySelector("#wrap_t2").addEventListener('click', function () {
        wrapT = gl.MIRRORED_REPEAT;
        drawScene();
    });  // eslint-disable-line

    function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }

    function radToDeg(r) {
        return r * 180 / Math.PI;
    }

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    const fieldOfViewRadians = degToRad(60);

    drawScene();

    // Draw the scene.
    function drawScene() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the framebuffer texture.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Compute the matrix
        // const scaleFactor = 2.5;
        const scaleFactor = 10;
        const tsize = 80 * scaleFactor;
        const x = gl.canvas.clientWidth / 2 - tsize / 2;
        const y = gl.canvas.clientHeight - tsize - 60;
        gridContainer.style.left = (x - 50 * scaleFactor) + 'px';
        gridContainer.style.top = (y - 50 * scaleFactor) + 'px';
        gridContainer.style.width = (scaleFactor * 400) + 'px';
        gridContainer.style.height = (scaleFactor * 300) + 'px';

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 3;          // 3 components per iteration

        // 2 components per iteration
        let type = gl.FLOAT;   // the data is 32bit floats

        // the data is 32bit floats
        let normalize = false; // don't normalize the data

        // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position

        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset)

        // Turn on the teccord attribute
        gl.enableVertexAttribArray(texcoordLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        size = 2;
        type = gl.FLOAT;
        normalize = false;
        stride = 0;
        offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            texcoordLocation, size, type, normalize, stride, offset)

        // Compute the projection matrix
        const projectionMatrix =
            m4.orthographic(0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

        let matrix = m4.translate(projectionMatrix, x, y, 0);
        matrix = m4.scale(matrix, tsize, tsize, 1);
        matrix = m4.translate(matrix, 0.5, 0.5, 0);

        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        // Tell the shader to use texture unit 0 for u_texture
        gl.uniform1i(textureLocation, 0);

        // Draw the geometry.
        gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    }
}

// Fill the buffer with the values that define a plane.
function setGeometry(gl) {
    const positions = new Float32Array(
        [
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
        ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// Fill the buffer with texture coordinates for a plane.
function setTexcoords(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
            [
                -3, -1,
                2, -1,
                -3, 4,
                -3, 4,
                2, -1,
                2, 4,
            ]),
        gl.STATIC_DRAW);
}

main();
