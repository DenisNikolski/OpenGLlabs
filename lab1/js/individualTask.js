// WebGL - Less Code More Fun
// from https://webglfundamentals.org/webgl/webgl-less-code-more-fun-triangle.html

"use strict";

function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("canvas");
    let gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    gl.enable(gl.DEPTH_TEST);

    // a single triangle
    const arrays = {
        position: {numComponents: 3, data: [0, -10, 0, 10, 10, 0, -10, 10, 0],},
        texcoord: {numComponents: 2, data: [0.5, 0, 1, 1, 0, 1],},
        normal: {numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1],},
    };

    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays);

    // setup GLSL program
    const program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);
    const uniformSetters = webglUtils.createUniformSetters(gl, program);
    const attribSetters = webglUtils.createAttributeSetters(gl, program);

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    const cameraAngleRadians = degToRad(0);
    const fieldOfViewRadians = degToRad(60);
    const cameraHeight = 50;

    const uniformsThatAreTheSameForAllObjects = {
        u_lightWorldPos: [-50, 30, 100],
        u_viewInverse: m4.identity(),
        u_lightColor: [1, 1, 1, 1],
    };

    const uniformsThatAreComputedForEachObject = {
        u_worldViewProjection: m4.identity(),
        u_world: m4.identity(),
        u_worldInverseTranspose: m4.identity(),
    };

    const rand = function (min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + Math.random() * (max - min);
    };

    const randInt = function (range) {
        return Math.floor(Math.random() * range);
    };

    const textures = [
        textureUtils.makeStripeTexture(gl, {color1: "#FFF", color2: "#CCC",}),
        textureUtils.makeCheckerTexture(gl, {color1: "#FFF", color2: "#CCC",}),
        textureUtils.makeCircleTexture(gl, {color1: "#FFF", color2: "#CCC",}),
    ];

    const objects = [];
    const numObjects = 300;
    const baseColor = rand(240);
    for (let ii = 0; ii < numObjects; ++ii) {
        objects.push({
            radius: rand(150),
            xRotation: rand(Math.PI * 2),
            yRotation: rand(Math.PI),
            materialUniforms: {
                u_colorMult:             chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(),
                u_diffuse:               textures[randInt(textures.length)],
                u_specular:              [1, 1, 1, 1],
                u_shininess:             rand(500),
                u_specularFactor:        rand(1),
            },
        });
    }

    requestAnimationFrame(drawScene);

    // Draw the scene.
    function drawScene(time) {
        time = time * 0.0001 + 5;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projectionMatrix =
            m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        // Compute the camera's matrix using look at.
        const cameraPosition = [0, 0, 100];
        const target = [0, 0, 0];
        const up = [0, 1, 0];
        const cameraMatrix = m4.lookAt(cameraPosition, target, up, uniformsThatAreTheSameForAllObjects.u_viewInverse);

        // Make a view matrix from the camera matrix.
        const viewMatrix = m4.inverse(cameraMatrix);

        const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        gl.useProgram(program);

        // Setup all the needed attributes.
        webglUtils.setBuffersAndAttributes(gl, attribSetters, bufferInfo);

        // Set the uniforms that are the same for all objects.
        webglUtils.setUniforms(uniformSetters, uniformsThatAreTheSameForAllObjects);

        // Draw objects
        objects.forEach(function(object) {

            // Compute a position for this object based on the time.
            let worldMatrix = m4.xRotation(object.xRotation * time);
            worldMatrix = m4.yRotate(worldMatrix, object.yRotation * time);
            worldMatrix = m4.translate(worldMatrix, 0, 0, object.radius);
            uniformsThatAreComputedForEachObject.u_world = worldMatrix;

            // Multiply the matrices.
            m4.multiply(viewProjectionMatrix, worldMatrix, uniformsThatAreComputedForEachObject.u_worldViewProjection);
            m4.transpose(m4.inverse(worldMatrix), uniformsThatAreComputedForEachObject.u_worldInverseTranspose);

            // Set the uniforms we just computed
            webglUtils.setUniforms(uniformSetters, uniformsThatAreComputedForEachObject);

            // Set the uniforms that are specific to the this object.
            webglUtils.setUniforms(uniformSetters, object.materialUniforms);

            // Draw the geometry.
            gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
        });

        requestAnimationFrame(drawScene);
    }
}

main();
