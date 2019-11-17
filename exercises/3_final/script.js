"use strict";

var vs = `#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

var fs = `#version 300 es
precision mediump float;

// Passed in from the vertex shader.
in vec4 v_color;

uniform vec4 u_colorMult;

out vec4 outColor;

void main() {
   outColor = v_color * u_colorMult;
}
`;

class Uniforms {

    constructor (u_colorMult) {

        this.u_colorMult = u_colorMult;
        this.u_matrix = m4.identity();
    }
}

class ObjectInfo {

    constructor(translation, rotation, uniforms) {

        this.translation = translation;
        this.rotation = rotation;
        this. uniforms = uniforms
    }
    
    computeMatrix(viewProjectionMatrix) {

        let matrix = m4.translate(viewProjectionMatrix,
            this.translation[0],
            this.translation[1],
            this.translation[2]);
  
        matrix = m4.xRotate(matrix, this.rotation[0]);
        matrix = m4.yRotate(matrix, this.rotation[1]);
        this.uniforms.u_matrix = m4.zRotate(matrix, this.rotation[2]);
    }
}

class Model {

    constructor(gl, vs, fs, bufferInfo, uniforms = 0, objectsNumber = 0, translationDist = [0, 0, 0], rotationDist = [0, 0, 0], initialTranslation = [0, 0, 0], initialRotation = [0, 0, 0]) {
        
        this.gl = gl;
        this.programInfo = twgl.createProgramInfo(gl, [vs, fs]);
        this.bufferInfo = bufferInfo;
        this.vertexArray = twgl.createVAOFromBufferInfo(gl, this.programInfo, bufferInfo);

        this.objects = [];

        let currentTranslation = initialTranslation;
        let currentRotation = initialRotation;

        for(let i = 0; i < objectsNumber; i++) {

            this.objects[i] = new ObjectInfo(currentTranslation, currentRotation, new Uniforms([0.5, 0.5, 0.5, 1]));

            currentTranslation[0] += translationDist[0];
            currentTranslation[1] += translationDist[1];
            currentTranslation[2] += translationDist[2];

            currentRotation[0] += rotationDist[0];
            currentRotation[1] += rotationDist[1];
            currentRotation[2] += rotationDist[2];
        }
    }

    computeMatrix(viewProjectionMatrix) {

        for(let i = 0; i < this.objects.length; i++) {

            let object = this.objects[i];
            object.computeMatrix(viewProjectionMatrix);
        }
      }

    draw() {

        this.gl.useProgram(this.programInfo.program);
        this.gl.bindVertexArray(this.vertexArray);

        for(let i = 0; i < this.objects.length; i++) {

            twgl.setUniforms(this.programInfo, this.objects[i].uniforms);
            twgl.drawBufferInfo(this.gl, this.bufferInfo);
        }
    }
}

class Camera {

    constructor() {

    }
}

function main() {
  
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  var programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  twgl.setAttributePrefix("a_");

  var test_model = new Model(gl,
                             vs,
                             fs,
                             flattenedPrimitives.createCubeBufferInfo(gl, 20),
                             new Uniforms([0.5, 0.5, 0.5, 1]),
                             2,
                             [10, 10, 0],
                             [0, 0, 0],
                             [0, 0, 0],
                             [0, 0, 0]);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {

    time = time * 0.0005;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    var cameraPosition = [0, 0, 100];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    test_model.computeMatrix(viewProjectionMatrix);

    // ------ Draw the objects --------

    test_model.draw();

    requestAnimationFrame(drawScene);
  }
}

main();