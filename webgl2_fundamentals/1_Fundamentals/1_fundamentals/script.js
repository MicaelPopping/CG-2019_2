var vertexShaderSource = `#version 300 es
     
// um atributo é um input (in) para um vertex shader.
// ele receberá dados de um buffer
in vec4 a_position;
 
// todos os shaders possuem uma função main
void main() {
 
// gl_Position é uma variável especial de um vertex shader
// é responsável pela configuração
gl_Position = a_position;
}
`;
 
var fragmentShaderSource = `#version 300 es
 
// fragment shaders não tem uma precisão padrão, então nós precisamos
// escolher uma. mediump é um bom valor padrão. Do Inglês "medium precision", significa "precisão média"
precision mediump float;
 
// precisamos declarar um output para o fragment shader
out vec4 outColor;
 
void main() {
  // Simplesmente defina o output para um constante com uma cor avermelhada-roxa
  outColor = vec4(1, 0, 0.5, 1);
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

    // Criando os shaders GLSL. 
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Fazendo o link dos shaders e criando o programa.
    var program = createProgram(gl, vertexShader, fragmentShader);

    // Outro modo de linkar os shaders e montar o programa.
    //var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

    /** 
     * Localizando e guardadno a posição do atributo a_position.
     * Criando um buffer.
     * Vinculando o buffer de posição. Ponto de ligação.
     */ 
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Colocando dados no buffer, referenciando-o através do ponto de ligação.
    var positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    /**
     * Cria uma coleção do estado do atributo.
     * Vincula.
     */
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Ativa o atributo. Fala que queremos tirar os dados de um buffer.
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Especificando como obter os dados.
    var size = 2; // 2 componentes por iteração.
    var type = gl.FLOAT; // Os dados são floats de 32 bits.
    var normalize = false; // Não normalize os dados.
    var stride = 0; // 0 = mover para frente size * sizeof(type) cada iteração para obter a proxima iteração.
    var offset = 0; // Comece no inicio do buffer.

    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset
    );

    // Manipula o tamanho da tela. Não entendi muito bem.
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Limpar o canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Fala para usar o programa
    gl.useProgram(program);

    // Vincula o atributo/buffer que desejamos.
    gl.bindVertexArray(vao);

    // Executando nosso programa.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);
}

/**
 * Cria e compila o shader.
 */
function createShader(gl, type, source) {

    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if(success)
        return shader;

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

/**
 * Cria o programa e faz o link dos 2 shaders.
 */
function createProgram(gl, vertexShader, fragmentShader) {

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if(success)
        return program;

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

main()