var renderer, scene, camera;

//Camaras adicionales planta, alzado y perfil
var planta, alzado, perfil;
var L = 120; //semilado de la caja ortografica
var altura_media = 116.5;
//controlar la camara
var cameraControls;

function setCameras(ar)
{
    //Configurar las 3 camaras ortograficas
    var camaraOrtografica;
    camaraOrtografica = new THREE.OrthographicCamera(-L+50, L-50, L-50, -L+50, -100, 200);
    planta = camaraOrtografica.clone();
    planta.position.set(0, L, 0);
    planta.lookAt(0,0,0);
    planta.up = new THREE.Vector3(0,0,-1);

    scene.add(planta);
}

function init()
{
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    document.getElementById("container").appendChild(renderer.domElement);
    renderer.autoClear = false;

    scene = new THREE.Scene();

    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1800);
    camera.position.set(125, 250, 95); //Camara vista desde arriba a un lado
    //camera.lookAt(-150, 0, -150); //Camara vista desde arriba
    setCameras(aspectRatio);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(-150, 0, -150);

    //captura de eventos

    window.addEventListener('resize', updateAspectRatio);
    //angulo = 0;
    //camera.position.set(55, 300, 30); // vista de planta
    //camera.lookAt(55, 0, 30); //vista de planta
    renderer.domElement.addEventListener('dblclick', rotateFigure);
}

function rotateFigure(event) {
    //Capturar coordenadas del click
    var x = event.clientX;
    var y = event.clientY;
    //Zona Click
    var derecha = false;
    var abajo = false;
    var cam = null;
    if (x > window.innerWidth/2) {
        derecha = true;
        x -= window.innerWidth/2; 
    }
    if (y > window.innerHeight/2) {
        abajo = true;
        y -= window.innerHeight/2;
    }
    if (derecha) {
        if (abajo) cam = camera;
        else cam = perfil;
    } else {
        if (abajo) cam = planta;
        else cam = alzado;
    }
    //cam es la camara que recibe el click
    //Normalizar a cuadrado de 2x2
    x = (x * 4 / window.innerWidth) - 1;
    y = -(y * 4 / window.innerHeight) + 1;
    //Counstruir el rayo
    var rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y),cam);
    var intersecciones = rayo.intersectObjects(scene.children, true);
    /*if (intersecciones.length > 0) {
        intersecciones[0].object.rotation.x += Math.PI / 8;
    }*/
}

function loadScene() {

    //Puntos de la pinza
    var vA0 = new THREE.Vector3(-9.5, -10, 2);
    var vA1 = new THREE.Vector3(9.5, -5, 1);
    var vA2 = new THREE.Vector3(-9.5, 10, 2);
    var vA3 = new THREE.Vector3(9.5, 5, 1);

    var vB0 = new THREE.Vector3(-9.5, -10, -2);
    var vB1 = new THREE.Vector3(9.5, -5, -1);
    var vB2 = new THREE.Vector3(-9.5, 10, -2);
    var vB3 = new THREE.Vector3(9.5, 5, -1);
    //Geometria de la pinza
    const pinzaShape = new THREE.Geometry();
    pinzaShape.vertices.push(vA0, vA1, vA2, vA3, vB0, vB1, vB2, vB3);
    pinzaShape.faces.push(
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(0, 1, 3),

        new THREE.Face3(1, 7, 3),
        new THREE.Face3(1, 5, 7),

        new THREE.Face3(5, 6, 7),
        new THREE.Face3(5, 4, 6),

        new THREE.Face3(4, 2, 6),
        new THREE.Face3(4, 0, 2),

        new THREE.Face3(2, 7, 6),
        new THREE.Face3(2, 3, 7),

        new THREE.Face3(4, 1, 0),
        new THREE.Face3(4, 5, 1),
    );

    //Definición del material y de las geometrias generales
    var material = new THREE.MeshBasicMaterial({ color: 0xFF0000, wireframe: true });
    var geometryPlane = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var geometryBase = new THREE.CylinderGeometry(50, 50, 15, 32);
    var geometryEje = new THREE.CylinderGeometry(20, 20, 18, 32);
    var geometryEsp = new THREE.BoxGeometry(18, 120, 12, 1);
    var geometryRot = new THREE.SphereGeometry(20, 32, 16);
    var geometryDis = new THREE.CylinderGeometry(22, 22, 6, 32);
    var geometryNer = new THREE.BoxGeometry(4, 4, 80, 1);
    var geometryMan = new THREE.CylinderGeometry(15, 15, 40, 32);
    var geometryPin1 = new THREE.BoxGeometry(19, 20, 4, 1);

    //Aplicamos el material y gemoetra y generamos los objetos en la escena
    var plane = new THREE.Mesh(geometryPlane, material);
    var base = new THREE.Mesh(geometryBase, material);
    var eje = new THREE.Mesh(geometryEje, material);
    var esparrago = new THREE.Mesh(geometryEsp, material);
    var rotula = new THREE.Mesh(geometryRot, material);
    var disco = new THREE.Mesh(geometryDis, material);
    var nervio0 = new THREE.Mesh(geometryNer, material);
    var nervio1 = new THREE.Mesh(geometryNer, material);
    var nervio2 = new THREE.Mesh(geometryNer, material);
    var nervio3 = new THREE.Mesh(geometryNer, material);
    var mano = new THREE.Mesh(geometryMan, material);
    var pinzaI1 = new THREE.Mesh(geometryPin1, material);
    var pinzaD1 = new THREE.Mesh(geometryPin1, material);
    var pinzaI2 = new THREE.Mesh(pinzaShape, material);
    var pinzaD2 = new THREE.Mesh(pinzaShape, material);

    //Creamos los objetos o entidades que no son visibles
    robot = new THREE.Object3D();
    brazo = new THREE.Object3D();
    antebrazo = new THREE.Object3D();

    //Movemos cada objeto en funcion del arbol de escena
    robot.position.y = 7.5;

    plane.rotation.x = -Math.PI / 2;

    eje.position.y = 12;
    eje.rotation.x = Math.PI / 2;

    esparrago.position.y = 60;

    rotula.position.y = 120;

    antebrazo.position.y = 120;

    nerv_dis = 22 / 3;
    nervio0.position.y = 40;
    nervio0.position.x = nerv_dis;
    nervio0.position.z = nerv_dis;
    nervio1.position.y = 40;
    nervio1.position.x = nerv_dis;
    nervio1.position.z = -nerv_dis;
    nervio2.position.y = 40;
    nervio2.position.x = -nerv_dis;
    nervio2.position.z = nerv_dis;
    nervio3.position.y = 40;
    nervio3.position.x = -nerv_dis;
    nervio3.position.z = -nerv_dis;

    nervio0.rotation.x = Math.PI / 2;
    nervio1.rotation.x = Math.PI / 2;
    nervio2.rotation.x = Math.PI / 2;
    nervio3.rotation.x = Math.PI / 2;

    mano.position.y = 80;

    mano.rotation.x = Math.PI / 2;
    pinzaI1.rotation.x = Math.PI / 2;
    pinzaD1.rotation.x = Math.PI / 2;
    pinzaI2.rotation.x = Math.PI / 2;
    pinzaD2.rotation.x = Math.PI / 2;
    pinzaI1.position.x = 10;
    pinzaD1.position.x = 10;
    pinzaI1.position.y = nerv_dis;
    pinzaD1.position.y = -nerv_dis;
    pinzaI2.position.y = nerv_dis;
    pinzaD2.position.y = -nerv_dis
    pinzaI2.position.x = 29;
    pinzaD2.position.x = 29;

    //añadimos cada objeto a la escena como dicta el grafo de escena
    scene.add(plane);
    scene.add(robot);

    robot.add(base);
    base.add(brazo);
    brazo.add(eje);
    brazo.add(esparrago);
    brazo.add(rotula);
    brazo.add(antebrazo);
    antebrazo.add(disco);
    antebrazo.add(nervio0);
    antebrazo.add(nervio1);
    antebrazo.add(nervio2);
    antebrazo.add(nervio3);
    antebrazo.add(mano);
    mano.add(pinzaI1);
    mano.add(pinzaD1);
    mano.add(pinzaI2);
    mano.add(pinzaD2);
}

function update()
{
    /*angulo+=0.005
    robot.rotation.y=angulo;*/
}
function updateAspectRatio()
{
    //Se diapara cuando se cambia el area de dibujo
    renderer.setSize(window.innerWidth, window.innerHeight);
    var ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}
function render()
{
    requestAnimationFrame(render);
    update();
    renderer.clear();

    //Perfil
    renderer.setViewport(0,0,window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    //renderer.render(scene, camera);

    //Planta
    if (window.innerHeight > window.innerWidth) {
        renderer.setViewport(0,0,window.innerWidth/4, window.innerWidth/4);
    } else {
        renderer.setViewport(0,0,window.innerHeight/4, window.innerHeight/4);
    }
    
    renderer.render(scene, planta);
}

init();
loadScene();
render();