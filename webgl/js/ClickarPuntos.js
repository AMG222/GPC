/*
Seminario 1. Clickar puntos con Webgl
*/

// SHADER DE VERTICES
var VSHADER_SOURCE =
    'attribute vec3 posicion;                 \n' +
    'attribute vec4 color;                    \n' +
    'varying highp vec4 vColor;               \n' +
    'void main(){                             \n' +
    '  gl_Position = vec4(posicion,1.0);      \n' +
    '  gl_PointSize = 10.0;                   \n' +
    '  vColor = color;                        \n' +
    '}                                        \n'
 
// SHADER DE FRAGMENTOS
var FSHADER_SOURCE =
'uniform highp vec4 color;                \n' +
'void main(){                             \n' +
'  gl_FragColor = vColor;                 \n' +
'}                                        \n'


// Globales
var clicks = [];
var colores = []; // array de colores de puntos respecto al centro
coloresClick = [];
var DIST_MAX = 1
// setup GLSL program
function main()
{
    // Recupera el canvas
    var canvas = document.getElementById("canvas");
    if( !canvas ){
        console.log("Fallo en el canvas");
        return;
    }

    // Asigna el contexto grafico
    var gl = getWebGLContext( canvas );
    if( !gl ){
        console.log("Fallo el contexto grafico");
        return;
    }
    // Carga, compila y monta los shaders
    if ( !initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE) ){
        console.log("Fallo la carga de los shaders");
        return;
    } 

    // Color de fondo
    gl.clearColor( 0.0, 0.0, 0.2, 1.0 );

    // Localiza el atributo 'posicion' en shader
    var coordenadas = gl.getAttribLocation( gl.program, 'posicion');
    var bufferColores= null
    // Crear el buffer, seleccionarlo y activar la conexion
    var bufferVertices = gl.createBuffer();
    bufferColores = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferVertices );
    gl.vertexAttribPointer( coordenadas, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( coordenadas );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferColores );
    // Localiza la variable 'color' en el shader
    colorFragmento = gl.getUniformLocation( gl.program, 'color' );

    // Registrar la callback de click de raton
    canvas.onmousedown = function( evento ){
        click( evento, gl, canvas );
    }

    // Dibujar
    render( gl );
    
}

function click( evento, gl, canvas )
{
    // Leer la coordenada del click. Sistema de referencia del documento
    var x = evento.clientX;
    var y = evento.clientY;
    // Situaci�n del canvas en el documento
    var rect = evento.target.getBoundingClientRect();

    // Sistema de referencia del documento:
    //   Origen: TopLeft del area cliente
    //   Ejes: X+ derecha, Y+ abajo
    //   Dimensiones: ancho x alto (px) del documento
    //
    // Sistema de referencia de Webgl (por defecto)
    //   Origen: Centro
    //   Ejes: X+ derecha, Y+ arriba
    //   Dimensiones: 2x2 en R2 ajustado al canvas

    // Transformar s.r. documento a s.r. Webgl
    x = ((x - rect.left) - canvas.width/2) * 2/canvas.width;
    y = (canvas.height/2 - (y - rect.top)) * 2/canvas.height;
    clicks.push(x); clicks.push(y); clicks.push(0.0);
    col = DIST_MAX - Math.sqrt(x*x + y*y)/2
    for (var i=0; i < 3; i++) coloresClick.push(col)
    coloresClick.push(1.0)
    // Guardar el punto (x,y,z) y dibujar la lista   
   
    render(gl);
}

function render( gl )
{
    var puntos = new Float32Array(clicks);
    var colores = new Float32Array(coloresClick);
    // Borrar el canvas    
    gl.clear(gl.COLOR_BUFFER_BIT);       
    //gl.uniform3f(colorFragmento,col, col, col);
    // Rellenar el VBO y mandar al shader
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertices);
    gl.bufferData( gl.ARRAY_BUFFER, puntos, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColores);
    gl.bufferData( gl.ARRAY_BUFFER, colores, gl.STATIC_DRAW);   
    // Asignar el BO a un atributo concreto      
    gl.drawArrays( gl.POINTS, 0, clicks.length/3 );
    gl.drawArrays( gl.LINE_STRIP, 0, clicks.length/3 );
}
