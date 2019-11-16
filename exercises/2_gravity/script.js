// WebGL2 - Multiple Objects - List
// from https://webgl2fundamentals.org/webgl/webgl-multiple-objects-list.html


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

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Tell the twgl to match position with a_position, n
  // normal with a_normal etc..
  twgl.setAttributePrefix("a_");

  var sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);
  var cubeBufferInfo   = flattenedPrimitives.createCubeBufferInfo(gl, 50);

  // setup GLSL program
  var programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  var sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);
  var cubeVAO   = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);

  // Uniforms for each object.
  var sphereUniforms = {
    u_colorMult: [0.5, 1, 0.5, 1],
    u_matrix: m4.identity(),
  };
  var cubeUniforms = {
    u_colorMult: [1, 0.5, 0.5, 1],
    u_matrix: m4.identity(),
  };
  
  var alturaEsfera = 100;
  var sphereTranslation = [ -40, alturaEsfera - 54, 0];
  var cubeTranslation   = [-40, -90, 0];
  var cameraPosition = [0, 0, 150];
  var ultFrame = 0.0;
  var animar = 0;

  var objectsToDraw = [
    {
      programInfo: programInfo,
      bufferInfo: sphereBufferInfo,
      vertexArray: sphereVAO,
      uniforms: sphereUniforms,
    },
    {
      programInfo: programInfo,
      bufferInfo: cubeBufferInfo,
      vertexArray: cubeVAO,
      uniforms: cubeUniforms,
    },
  ];

  function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
    var matrix = m4.translate(viewProjectionMatrix,
        translation[0],
        translation[1],
        translation[2]);
    matrix = m4.xRotate(matrix, xRotation);
    return m4.yRotate(matrix, yRotation);
  }

  requestAnimationFrame(drawScene);
  
  // Setup a ui.
  webglLessonsUI.setupSlider("#AltEsfera", {value: alturaEsfera, slide: updateAltEsfera, min: 0, max: 500}); // -54 colide
  webglLessonsUI.setupSlider("#cameraZ", {value: cameraPosition[2], slide: updateCameraZ, min: 0, max: 300});
  webglLessonsUI.setupSlider("#iniciar", {value: animar, slide: updateIniciar, min: 0, max: 1});
  
  function updateAltEsfera(event, ui) {
    sphereTranslation[1] = ui.value -54;
    requestAnimationFrame(drawScene);
  }
  
  function updateCameraZ(event, ui) {
    cameraPosition[2] = ui.value;
    requestAnimationFrame(drawScene);
  }
  
  function updateIniciar(event, ui) {
    animar = ui.value;
    requestAnimationFrame(drawScene);
  }

  // Draw the scene.
  function drawScene(time) {
    time *= 0.001; // *= 0.001 para segundo
    var deltaTime = time - ultFrame;
    ultFrame = time;
    
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    
    if(animar == 1) {
      if(sphereTranslation[1] > -54) {
        sphereTranslation[1] -= 10 * deltaTime;
        if(sphereTranslation[1] < -54) {
            sphereTranslation[1] = -54;
            animar = 0;
        }
      }
    }

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    var target = sphereTranslation;
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // Compute the matrices for each object.
    sphereUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        sphereTranslation,
        0,
        0);

    cubeUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        cubeTranslation,
        0,
        0);
    
    // ------ Draw the objects --------

    objectsToDraw.forEach(function(object) {
      var programInfo = object.programInfo;

      gl.useProgram(programInfo.program);

      // Setup all the needed attributes.
      gl.bindVertexArray(object.vertexArray);

      // Set the uniforms we just computed
      twgl.setUniforms(programInfo, object.uniforms);

      twgl.drawBufferInfo(gl, object.bufferInfo);
    });

    requestAnimationFrame(drawScene);
  }
}

main();
