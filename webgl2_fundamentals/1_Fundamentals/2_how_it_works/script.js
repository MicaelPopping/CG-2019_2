var vertexShaderSource = `#version 300 es
     
in vec2 a_position;
in vec4 a_color;

uniform mat3 u_matrix;

out vec4 v_color;

void main() {

  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  v_color = a_color;
}
`;
 
var fragmentShaderSource = `#version 300 es
 
precision mediump float;

in vec4 v_color;
 
out vec4 outColor;
 
void main() {

  outColor = v_color;
}
`;

function main() {

    // Obtendo o elemento canvas do html.
    var canvas = document.getElementById("canvas");

    // Criando um contexto (WebGL2RenderingContext).
    var gl = canvas.getContext("webgl2");

    if(!gl) {

        print('Sem WebGL para você!');
        return;
    }

    // Fazendo o link dos shaders e criando o programa.
    var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

    //Localizando e guardadno as posições dos atributos.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getAttribLocation(program, "a_color");

    //Localizando e guardadno a posições do uniform.
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Cria conjunto de atributos.
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Criando um buffer para as posições.
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setGeometry(gl);

    // Informa ao atributo position como extrair os dados do array buffer.
    gl.enableVertexAttribArray(positionLocation);
    var size = 2; // 2 componentes por iteração.
    var type = gl.FLOAT; // Os dados são floats de 32 bits.
    var normalize = false; // Não normalize os dados.
    var stride = 0; // 0 = mover para frente size * sizeof(type) cada iteração para obter a proxima iteração.
    var offset = 0; // Comece no inicio do buffer.
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    // Criando um buffer para as cores.
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    setColors(gl);

    // Informa ao atributo color como extrair os dados do array buffer.
    gl.enableVertexAttribArray(colorLocation);
    var size = 4; // 2 componentes por iteração.
    var type = gl.FLOAT; // Os dados são floats de 32 bits.
    var normalize = false; // Não normalize os dados.
    var stride = 0; // 0 = mover para frente size * sizeof(type) cada iteração para obter a proxima iteração.
    var offset = 0; // Comece no inicio do buffer.
    gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

    var translation = [350, 150];
    var angleRadians = 0;
    var scale = [1, 1];

    drawScene();

    function drawScene() {

        // Manipula o tamanho da tela. Não entendi muito bem.
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Limpar o canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Fala para usar o programa
        gl.useProgram(program);

        // Vincula o atributo/buffer que desejamos.
        gl.bindVertexArray(vao);

        // Gerando a matriz
        var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
        matrix = m3.translate(matrix, translation[0], translation[1]);
        matrix = m3.rotate(matrix, angleRadians);
        matrix = m3.scale(matrix, scale[0], scale[1]);

        // Colocando a matriz no uniform.
        gl.uniformMatrix3fv(matrixLocation, false, matrix);

        // Executando nosso programa.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }
}

/**
 * 
 */
function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -150, -100,
             150, -100,
            -150,  100,
             150, -100,
            -150,  100,
             150,  100,
        ]),
        gl.STATIC_DRAW);
}

function setColors(gl) {

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            Math.random(), Math.random(), Math.random(), 1,
            Math.random(), Math.random(), Math.random(), 1,
            Math.random(), Math.random(), Math.random(), 1,
            Math.random(), Math.random(), Math.random(), 1,
            Math.random(), Math.random(), Math.random(), 1,
            Math.random(), Math.random(), Math.random(), 1,
        ]),
        gl.STATIC_DRAW);
}

main();