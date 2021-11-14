var renderer, scene, camera;
var keyMap=[];
//Camaras adicionales planta, alzado y perfil
var planta, alzado, perfil, base, pinzaI, pinzaD, mano, altura = 15, sizeE=1.3;
var mouseX, mouseY;
var objects = []
var objectsW = []
var salto_a = altura+sizeE+1;
const mouse = new THREE.Vector2();
const target = new THREE.Vector3(0, 10, 150);
const windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );
var velocity = 0.03*altura, vx = 0, vy = 0, vz = 0;
var side = 1;
var camSphere;
var to_R = Math.PI / 180;
var sensibilidad = 66, enable = false;
var canJump = false;
//controlar la camara
var cameraControls, sphereBody, keyboard, effectController, fps;
var mov1, mov2, mov3, mov4;
var lleg1=false, lleg2=false, lleg3=false, lleg4=false;
var coll1, coll2, coll3;
var cog1=false, cog2=false, cog3=false;
var collT1, collT2;
var cogT1=false, cogT2=false, cogT3=false;
var puntuacion = 0;
var inicio;
var final, end = false;
var fin = 0;
var cargador, oro, plata, cobre, uwu, anime, pancake, game_over;
function genBox(x,y,z, rotationX, rotationY, rotationZ, width, height, deph, mass, material) {
    /*x = x position
    y = y postion
    z = z position
    rotationX, rotationY, rotation Z,
    width size
    deph size
    falls
    material
    */
    var geometryCube = new THREE.BoxGeometry(width, height, deph, 1);
    var cube = new THREE.Mesh(geometryCube, material);
    cube.position.set(x,y,z);
    cube.rotation.x = rotationX;
    cube.rotation.y = rotationY;
    cube.rotation.z = rotationZ;
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    objects.push(cube)

    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, deph / 2));
    cubeBody = new CANNON.Body({mass, shape});
    cubeBody.position.set(x,y,z);
    var quatX = new CANNON.Quaternion();
    var quatY = new CANNON.Quaternion();
    var quatZ = new CANNON.Quaternion();
    quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), rotationX);
    quatY.setFromAxisAngle(new CANNON.Vec3(0,1,0), rotationY);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), rotationZ);
    var quaternion = quatY.mult(quatX);
    quaternion.normalize();
    quaternion = quatZ.mult(quaternion);
    //quaternion.normalize();
    cubeBody.quaternion = quaternion;
    world.addBody(cubeBody);
    objectsW.push(cubeBody);
    return objects.length-1
}
function genColl(x,y,z, rotationX, rotationY, rotationZ, size, material) {
    /*x = x position
    y = y postion
    z = z position
    width size
    deph size
    */
    var geometryDisc = new THREE.CylinderGeometry(size, size, 0.1, 16);
    var disco = new THREE.Mesh(geometryDisc, material);
    disco.position.set(x,y,z);
    disco.rotation.x = rotationX;
    disco.rotation.y = rotationY;
    disco.rotation.z = rotationZ;
    disco.castShadow = true;
    disco.receiveShadow = true;
    scene.add(disco);
    return disco
}
function initPhysicWorld() {
    world = new CANNON.World(); 
    world.gravity.set(0,-9.8,0); 
    world.solver.iterations = 10;
    var groundMaterial = new CANNON.Material("groundMaterial");
    world.addMaterial( groundMaterial );
    var groundShape = new CANNON.Plane();
    var ground = new CANNON.Body({ mass: 0, material: groundMaterial });
    ground.addShape(groundShape);
    ground.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(ground);
}
function setCameras(ar)
{
    //Configurar las 3 camaras ortograficas
    var camaraOrtografica;
    camaraOrtografica = new THREE.OrthographicCamera(-50, 50, 50, -50, -100, 200);
    planta = camaraOrtografica.clone();
    planta.position.set(0, 100, 0);
    planta.lookAt(0,0,0);
    planta.up = new THREE.Vector3(0,0,-1);

    scene.add(planta);
}
function init()
{
    var manager = new THREE.LoadingManager();
    cargador = new THREE.JSONLoader(manager);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    document.getElementById("container").appendChild(renderer.domElement);
    renderer.autoClear = false;
    renderer.antialias = true;
    scene = new THREE.Scene();
    game_over = document.getElementById("end");
    game_over.style.display = 'none';
    //let aux = new Date();
    //fin = aux.getTime();
    //let tiempo = Math.round((fin -  inicio)/1000);
    //let minutos = parseInt(tiempo/60);
    //let segundos = tiempo - 60*minutos;
    //let aux1 = '<span style="font-size:40px">Game Over</span>' + '<br>' + "Puntuación: " + puntuacion + ", Tiempo: " + minutos + ":" + segundos;
    //game_over.innerHTML = '<font size="5">' + aux1 + '</font>' + 
    //'<style>position: absolute;width: 100%;height: 100%;background-color: rgba(0,0,0,0.5);display: -webkit-box;display: -moz-box;display: box;-webkit-box-orient: horizontal;-moz-box-orient: horizontal;box-orient: horizontal;-webkit-box-pack: center;-moz-box-pack: center;box-pack: center;-webkit-box-align: center;-moz-box-align: center;box-align: center;color: #ffffff;text-align: center;</style>';
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1800);
    camera.position.set(0, altura, 450); //Camara vista desde arriba a un lado
    //const fps = new PointerLockControls(camera, renderer.domElement)
    //camera.lookAt(0, 10, -100); //Camara vista desde arriba
    setCameras(aspectRatio);
    /*cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(-150, 0, -150);
    cameraControls.enableRotate = false;
    cameraControls.enablePan = false;
    cameraControls.enableKeys=false;
    cameraControls.enableZoom=false;*/
    //captura de eventos
    setGui();
    window.addEventListener('resize', updateAspectRatio);
    document.addEventListener( 'mousemove', onMouseMove, false );
    //angulo = 0;
    //camera.position.set(55, 300, 30); // vista de planta
    //camera.lookAt(55, 0, 30); //vista de planta
    keyboard = new THREEx.KeyboardState(renderer.domElement);
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();
    document.addEventListener('keydown', function(event) {
        var keyCode = event.keyCode;
        if (enable || keyMap[keyCode] == keyMap[27]) {
            keyMap[keyCode] = true;
        }
    },false);

    document.addEventListener('keyup', function(event) {
        var keyCode = event.keyCode;
        if (enable || keyMap[keyCode] == keyMap[27]) {
            keyMap[keyCode] = false;
        }
    }, false);
    document.addEventListener('mousedown', function(event) {
        if (!enable) {
            enable = true;
            var blocker = document.getElementById( 'blocker' );
            blocker.style.display = 'none';
            var ahora = new Date();
            inicio = ahora.getTime();
        }
    }, false);
    
    function onMouseMove( event ) {
        if (enable) {
            mouseX = ( event.clientX - windowHalf.x );
            mouseY = ( event.clientY - windowHalf.y );
            mouseX = sensibilidad * mouseX * 0.01;
            mouseY = sensibilidad * mouseY * 0.0001;
            var angulo = mouseX*to_R+Math.PI/2;
            target.x = Math.cos(angulo) + camera.position.x;
            target.y =  - mouseY + camera.position.y;
            target.z = Math.sin(angulo) + camera.position.z;
            camera.lookAt(target)
            renderer.render( scene, camera );
        }
    }

    //Prepare sphere of the camera
    const sphereShape = new CANNON.Sphere(sizeE);
    camSphere = new CANNON.Body({ mass: 5})
    camSphere.addShape(sphereShape);
    camSphere.position.set(camera.position.x,camera.position.y-altura/2,camera.position.z);
    camSphere.linearDamping = 0;
    var contactNormal = new CANNON.Vec3();
    var upAxis = new CANNON.Vec3(0,1,0);
    camSphere.addEventListener('collide', function(event) {
        var contact = event.contact;
        // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
        // We do not yet know which one is which! Let's check.
        if(contact.bi.id == camSphere.id)  // bi is the player body, flip the contact normal
            contact.ni.negate(contactNormal);
        else
            contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is

        // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
        
        if(contactNormal.dot(upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
            canJump = true;
    });
    world.addBody(camSphere)
    
}
function executeMovement(){
    var angulo = mouseX*to_R+Math.PI/2;
    if(keyMap[87] && keyMap[65]) { //wa
        camSphere.position.z += velocity*Math.sin(angulo);
        camSphere.position.x += velocity*Math.cos(angulo);
        camSphere.position.z -= velocity*Math.sin(-mouseX*to_R);
        camSphere.position.x += velocity*Math.cos(-mouseX*to_R);
        if(keyMap[32]) jump(); //space
    } 
    else if(keyMap[87] && keyMap[68]) { //wd
        camSphere.position.z += velocity*Math.sin(angulo);
        camSphere.position.x += velocity*Math.cos(angulo);
        camSphere.position.z += velocity*Math.sin(-mouseX*to_R);
        camSphere.position.x -= velocity*Math.cos(-mouseX*to_R);
        if(keyMap[32]) jump(); //space
    } 
    else if(keyMap[87] && keyMap[68]) { //sa
        camSphere.position.z -= velocity*Math.sin(angulo);
        camSphere.position.x -= velocity*Math.cos(angulo);
        camSphere.position.z -= velocity*Math.sin(-mouseX*to_R);
        camSphere.position.x += velocity*Math.cos(-mouseX*to_R);
        if(keyMap[32]) jump(); //space
    } 
    else if(keyMap[83] && keyMap[68]) { //sd
        camSphere.position.z -= velocity*Math.sin(angulo);
        camSphere.position.x -= velocity*Math.cos(angulo);
        camSphere.position.z += velocity*Math.sin(-mouseX*to_R);
        camSphere.position.x -= velocity*Math.cos(-mouseX*to_R);
        if(keyMap[32]) jump(); //space
    } 

    else if(keyMap[87] && keyMap[16]) { //run
        camSphere.position.z += 1.25*velocity*Math.sin(angulo);
        camSphere.position.x += 1.25*velocity*Math.cos(angulo);
        if(keyMap[32]) jump(); //space
    }
    
    else if(keyMap[87]) { //w
        camSphere.position.z += velocity*Math.sin(angulo);
        camSphere.position.x += velocity*Math.cos(angulo);
        if(keyMap[32]) jump(); //space
    }
    else if(keyMap[65]) { //a
        camSphere.position.z -= velocity*Math.sin(-mouseX*to_R);
        camSphere.position.x += velocity*Math.cos(-mouseX*to_R);
        if(keyMap[32]) jump(); //space
    }
    else if(keyMap[83]) { //s
        camSphere.position.z -= velocity*Math.sin(angulo);
        camSphere.position.x -= velocity*Math.cos(angulo);
        if(keyMap[32]) jump(); //space
    }
    else if(keyMap[68]) { //d
        camSphere.position.z += velocity*Math.sin(-mouseX*to_R);
        camSphere.position.x -= velocity*Math.cos(-mouseX*to_R);
        if(keyMap[32]) jump(); //space
    }
    else if(keyMap[32]) jump(); //space
    else if(keyMap[85]) {
        for(i =0; i<objects.length; i++) {
            if (objectsW[i].mass != 0.5) {
                objects[i].material = agehao;
            }
        }
        coll1.material = uwu;
        coll2.material = uwu;
        coll3.material = uwu;
        collT1.material = anime;
        collT2.material = anime;
        final.material = pancake;
    } 
    else if(keyMap[79]) {
        for(i =0; i<objects.length; i++) {
            if (objectsW[i].mass != 0.5) {
                objects[i].material = madera;
            }
        }
        coll1.material = cobre;
        coll2.material = cobre;
        coll3.material = cobre;
        collT1.material = plata;
        collT2.material = plata;
        final.material = oro;
    }
    else if(keyMap[39]) {
        sensibilidad += 0.1;
    } else if(keyMap[37]) {
        if (sensibilidad >= 0){
            sensibilidad -= 0.1;
        } else {
            sensibilidad = 0.1;
        }
    } else if(keyMap[27]) {
        enable = false;
        var blocker = document.getElementById( 'blocker' );
        blocker.style.display = 'inline';
    }
    else { 
        camSphere.velocity.x = 0;
        camSphere.velocity.z = 0; 
    }
}
function jump() {
    if (canJump){
        camSphere.velocity.y = salto_a;
    } canJump = false;
}
function animate() {
    var x1 = objectsW[mov1].position.x;
    var x2 = objectsW[mov2].position.x;
    var x3 = objectsW[mov3].position.x;
    var x4 = objectsW[mov4].position.x;
    if (x1>25) {
        lleg1 = true
    }
    if (x1<-25) {
        lleg1 = false
    }
    if (x2>25) {
        lleg2 = true
    }
    if (x2<-25) {
        lleg2 = false
    }
    if (x3>25) {
        lleg3 = true
    }
    if (x3<-25) {
        lleg3 = false
    }
    if (x4>25) {
        lleg4 = false
    }
    if (x4<-25) {
        lleg4 = true
    }
    if (lleg1) {
        objectsW[mov1].position.x -= 0.1
    } else {
        objectsW[mov1].position.x += 0.1
    }
    if (lleg2) {
        objectsW[mov2].position.x -= 0.1
    } else {
        objectsW[mov2].position.x += 0.1
    }
    if (lleg3) {
        objectsW[mov3].position.x -= 0.25
    } else {
        objectsW[mov3].position.x += 0.25
    }
    if (lleg4) {
        objectsW[mov4].position.x += 0.25
    } else {
        objectsW[mov4].position.x -= 0.25
    }
    coll1.rotation.y += 0.01
    coll2.rotation.y += 0.01
    coll3.rotation.y += 0.01
    collT1.rotation.y += 0.01
    collT2.rotation.y += 0.01
    final.rotation.y += 0.01;
    renderer.render(scene, camera)
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
    var light = new THREE.AmbientLight(0xaaaaaa);
    scene.add(light);
    var lightP = new THREE.PointLight(0xff0000, 1, 100);
    lightP.position.set(0, 300, 0);
    scene.add(lightP);
    var spotLight = new THREE.SpotLight(0xaaaaaa)
    spotLight.position.set(20, 300, 20);
    spotLight.shadowCameraNear = 1;
    spotLight.shadowCameraFar = 5000;
    spotLight.shadowCameraVisible = true;
    spotLight.castShadow = true;
    spotLight.shadowMapWidth = 1024; // default is 512
    spotLight.shadowMapHeight = 1024; // default is 512
    scene.add(spotLight);
    var loader = new THREE.CubeTextureLoader();
    loader.setPath('images/ice/');
    var textureCube = loader.load([
        'posx.jpg', 'negx.jpg',
        'posy.jpg', 'negy.jpg',
        'posz.jpg', 'negz.jpg',
    ]);
    var shader = THREE.ShaderLib["cube"];
    shader.uniforms["tCube"].value = textureCube;
    var wallsMaterial = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });
    var room = new THREE.Mesh(new THREE.CubeGeometry(5000, 5000, 5000), wallsMaterial);
    scene.add(room);
    //Definición del material y de las geometrias generales
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    var nieveT = THREE.ImageUtils.loadTexture('./images/snow.jpg');
    var maderaT = THREE.ImageUtils.loadTexture('./images/wood512.jpg');
    var cobreT = THREE.ImageUtils.loadTexture('./images/cobre.jpg');
    var plataT = THREE.ImageUtils.loadTexture('./images/silver.jpg');
    var oroT = THREE.ImageUtils.loadTexture('./images/gold.jpg');
    var gatosT = THREE.ImageUtils.loadTexture('./images/gatitos.jpg');
    var uwuT = THREE.ImageUtils.loadTexture('./images/face2.jpg');
    var animeT = THREE.ImageUtils.loadTexture('./images/face1.png');
    var pancakeT = THREE.ImageUtils.loadTexture('./images/pancake.jpg');
    var agehaoT = THREE.ImageUtils.loadTexture('./images/agehao.jpg');
    //onLoad('./models/Precursor_Orb.stl')
    nieveT.repeat.set(10,10);
    nieveT.wrapS = nieveT.wrapT = THREE.RepeatWrapping;
    nieveT.magFilter = THREE.LinearFilter;
    nieveT.minFilter = THREE.LinearMipMapLinearFilter;
    madera = new THREE.MeshLambertMaterial({color: 0xFFFFFF, shading: THREE.SmoothShading, map: maderaT});
    cobre = new THREE.MeshLambertMaterial({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 70, map: cobreT});
    plata = new THREE.MeshLambertMaterial({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 70, map: plataT});
    oro = new THREE.MeshLambertMaterial({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 70, map: oroT});
    gatos = new THREE.MeshLambertMaterial({color: 0xFFFFFF, shading: THREE.SmoothShading, map: gatosT});
    uwu = new THREE.MeshLambertMaterial({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 70, map: uwuT});
    anime = new THREE.MeshLambertMaterial({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 70, map: animeT});
    pancake = new THREE.MeshLambertMaterial({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 70, map: pancakeT});
    agehao = new THREE.MeshLambertMaterial({color: 0xFFFFFF, shading: THREE.SmoothShading, map: agehaoT});
    var nieve = new THREE.MeshLambertMaterial({color: 0xFFFFFF, shading: THREE.SmoothShading, map: nieveT});
    var geometryPlane = new THREE.PlaneGeometry(5000, 5000, 10, 10);
    
    //Salto 45 (30)
    //Salto moviendose 60 (48)
    //Salto corriendo 70 (62)

    genBox( 0,3.75  ,415, 0,0,0, 15   ,7.5  ,15   , 0, madera);
    genBox( 0,7.5   ,400, 0,0,0, 15   ,15   ,15   , 0, madera);
    genBox( 0,15    ,355, 0,0,0, 15   ,30   ,15   , 0, madera);
    genBox( 0,19.5  ,300, 0,0,0, 15   ,45   ,15   , 0, madera);
    genBox( 0,48    ,275, 0,0,0, 15   ,15   ,15   , 0, madera);
    genBox( 0,52.5  ,230, 0,0,0, 15   ,15   ,30   , 0, madera);

    coll2 = genColl(15,70  ,140, 0,0,Math.PI/2, 1.875, cobre); //9.375

    genBox( 0,49.5  ,200, 0,0,0, 1.875,1.875,15   , 0, madera);

    coll1 = genColl(0,70  ,230, 0,0,Math.PI/2,1.875, cobre);

    genBox( 0,58.875,200, 0,0,0, 15   ,15   ,15   , 1, madera);
    genBox( 0,52.5  ,170, 0,0,0, 30   ,15   ,15   , 0, madera);
    genBox( 0,63    ,110, 0,0,0, 15   ,7.5  ,15   , 0, madera);
    genBox(50,64.5  ,100, 0,0,0, 45   ,1.875,1.875, 0, madera);
    genBox(88,67.5  ,100, 0,0,0, 15   ,3.75 ,15   , 0, madera);

    collT1 = genColl(88,78,100, 0,0,Math.PI/2,1.875, plata);

    genBox( 0,72    , 40, 0,0,0, 30   ,3.75 ,30   , 0, madera);
    genBox( 0,79.5  ,-90, 0,0,0, 30   ,7.5  ,30   , 0, madera);

    for (let i=0;i<3;i++){
        for (let j=0;j<3;j++){
            genBox(i*3.6,85.1,-90+j*3.6, 0, 0,0, 3.75,3.75,3.75, 0.5, gatos);
            if (i>0) {
                genBox(-i*3.6,85.1,-90+j*3.6, 0, 0,0, 3.75,3.75,3.75, 0.5, gatos);
            }
            if (j>0) {
                genBox(i*3.6,85.1,-90-j*3.6, 0, 0,0, 3.75,3.75,3.75, 0.5, gatos);
            }
            if (i>0 && j>0) {
                genBox(-i*3.6,85.1,-90-j*3.6, 0, 0,0, 3.75,3.75,3.75, 0.5, gatos);
            }
        }
    }
    for (let i=0;i<3;i++){
        for (let j=0;j<3;j++){
            genBox(i*3.6,92.6,-90+j*3.6, 0, 0,0, 3.75,3.75,3.75, 0.5, gatos);
            if (i>0) {
                genBox(-i*3.6,92.6,-90+j*3.6, 0, 0,0, 3.75,3.75,3.75, 0.5, gatos);
            }
            if (j>0) {
                genBox(i*3.6,92.6,-90-j*3.6, 0, 0,0, 3.75,3.75,3.75, 0.5, gatos);
            }
            if (i>0 && j>0) {
                genBox(-i*3.6,92.6,-90-j*3.6, 0, 0,0, 3.75,3.75,3.75, 0.5, gatos);
            }
        }
    }

    genBox(-40 ,82.5,-90, 0,0,0,  5,7.5, 5, 0, madera);
    genBox(-70 ,82.5,-90, 0,0,0,  5,7.5, 5, 0, madera);
    genBox(-100,82.5,-90, 0,0,0,  5,7.5, 5, 0, madera);
    genBox(-130,82.5,-90, 0,0,0, 15,7.5,15, 0, madera);

    collT2 = genColl(-130,93,-90,0,0,Math.PI/2,1.875, plata);

    coll3 = genColl(0,103,-190, 0,0,Math.PI/2,1.875, cobre);

    genBox(0,97.5,-220, 0,0,0,         15,7.5,15, 0, madera);
    genBox(0, 102,-300, 0,Math.PI/4,0, 30,7.5,30, 0, madera);

    final = genColl(0, 112,-300, 0,0,Math.PI/2,1.875, oro);

    mov1 = genBox(0,58.5, 140,  0,0,0, 15,7.5,15, 0, madera);
    mov2 = genBox(0,  75, -10,  0,0,0, 15,7.5,15, 0, madera);
    mov3 = genBox(0,  87,-150,  0,0,0, 15,7.5,15, 0, madera);
    mov4 = genBox(0,  93,-190,  0,0,0, 15,7.5,15, 0, madera);

    //frame perfect de altura: +0.5 y distancia 55
    //genBox(0,altura*1.5,300, 0, 0,0, altura,altura*3,altura, 0, madera);
    
    //Aplicamos el material y gemoetra y generamos los objetos en la escena
    var plane = new THREE.Mesh(geometryPlane, nieve);
    plane.castShadow = true;
    plane.receiveShadow = true;
    //Movemos cada objeto en funcion del arbol de escena

    plane.rotation.x = -Math.PI / 2;
    //añadimos cada objeto a la escena como dicta el grafo de escena
    scene.add(plane);
    /*cubeBody.position.x = cube.position.x
    cubeBody.position.y = cube.position.y
    cubeBody.position.z = cube.position.z
    cube.position.set(cubeBody.position.x, cubeBody.position.y, cubeBody.position.z)
    cube.quaternion.set(
        cubeBody.quaternion.x,
        cubeBody.quaternion.y,
        cubeBody.quaternion.z,
        cubeBody.quaternion.w
    )
    scene.add(cube);*/
}
function updatePhysics() {
    world.step(1/30);
    camera.position.x = camSphere.position.x;
    camera.position.y = camSphere.position.y+altura-sizeE;
    camera.position.z = camSphere.position.z;
    //camSphere.quaternion.copy(camera.quaternion)
    for(i =0; i<objects.length; i++) {
        objects[i].position.copy(objectsW[i].position);
        objects[i].quaternion.copy(objectsW[i].quaternion);
    }
}
function update()
{
    if (enable) {
        animate();
        updatePhysics();
        let cx = camSphere.position.x, cz = camSphere.position.z;
        let oy = coll1.position.y, oz = coll1.position.z, ox =  coll1.position.x;
        let dist = 5;
        if (!cog1 && cz < oz+dist && cz > oz-dist && cx < ox+dist && cx > ox-dist && oy > 20) {
            coll1.visible = false;
            cog1 = true;
            puntuacion += 10
        }
        oy = coll2.position.y, oz = coll2.position.z, ox =  coll2.position.x;
        if (!cog2 && cz < oz+dist && cz > oz-dist && cx < ox+dist && cx > ox-dist && oy > 20) {
            coll2.visible = false;
            cog2 = true;
            puntuacion += 10
        }
        oy = coll3.position.y, oz = coll3.position.z, ox =  coll3.position.x;
        if (!cog3 && cz < oz+dist && cz > oz-dist && cx < ox+dist && cx > ox-dist && oy > 20) {
            coll3.visible = false;
            cog3 = true;
            puntuacion += 10
        }
        oy = collT1.position.y, oz = collT1.position.z, ox =  collT1.position.x;
        if (!cogT1 && cz < oz+dist && cz > oz-dist && cx < ox+dist && cx > ox-dist && oy > 20) {
            collT1.visible = false;
            cogT1 = true;
            puntuacion += 50
        }
        oy = collT2.position.y, oz = collT2.position.z, ox =  collT2.position.x;
        if (!cogT2 && cz < oz+dist && cz > oz-dist && cx < ox+dist && cx > ox-dist && oy > 20) {
            collT2.visible = false;
            cogT2 = true;
            puntuacion += 50
        }
        oy = final.position.y, oz = final.position.z, ox =  final.position.x;
        if (!end && cz < oz+dist && cz > oz-dist && cx < ox+dist && cx > ox-dist && oy > 20) {
            final.visible = false;
            end = true;
            let aux = new Date();
            fin = aux.getTime();
            let tiempo = Math.round((fin -  inicio)/1000);
            let minutos = parseInt(tiempo/60);
            let segundos = tiempo - 60*minutos;
            let aux1 = '<span style="font-size:40px">Game Over</span>' + '<br>' + "Puntuación: " + puntuacion + ", Tiempo: " + minutos + ":" + segundos;
            game_over.innerHTML = '<font size="5">' + aux1 + '</font>' + 
            '<style>position: absolute;width: 100%;height: 100%;background-color: rgba(0,0,0,0.5);display: -webkit-box;display: -moz-box;display: box;-webkit-box-orient: horizontal;-moz-box-orient: horizontal;box-orient: horizontal;-webkit-box-pack: center;-moz-box-pack: center;box-pack: center;-webkit-box-align: center;-moz-box-align: center;box-align: center;color: #ffffff;text-align: center;</style>';
            game_over.style.display = 'inline';
            //enable = false;
        }
        if (!end) {
            let element = document.getElementById("puntuacion");
            element.innerHTML = "Puntuación: " + puntuacion
            element = document.getElementById("tiempo");
            let aux = new Date();
            fin = aux.getTime();
            let tiempo = Math.round((fin -  inicio)/1000);
            let minutos = parseInt(tiempo/60);
            let segundos = tiempo - 60*minutos;
            element.innerHTML = "Tiempo: " + minutos + ":" + segundos;
        }
        let elemento = document.getElementById("sensibilidad");
        elemento.innerHTML = "Sensiblidad: " + Number.parseFloat(sensibilidad).toPrecision(3)
    }
}
function setGui() 
{
    /*effectController = {
        mensaje: 'Interfaz',
        giroBase: 0.0,
        giroBrazo: 0.0,
        giroAntebrazoY: 0.0,
        giroAntebrazoZ: 0.0,
        giroPinza: 0.0,
        separacionPinza: 22/3,
    };

    var gui = new dat.GUI();

    var h = gui.addFolder("Control Robot");
    h.add(effectController, "mensaje").name("Aplicacion");
    h.add(effectController, "giroBase", -180.0, 180.0, 0.025).name("Giro de la Base");
    h.add(effectController, "giroBrazo", -45.0, 45.0, 0.025).name("Giro del Brazo");
    h.add(effectController, "giroAntebrazoY", -180.0, 180.0, 0.025).name("Giro del Antebrazo en Y");
    h.add(effectController, "giroAntebrazoZ", -90.0, 90.0, 0.025).name("Giro del Antebrazo en Z");
    h.add(effectController, "giroPinza", -40.0, 220.0, 0.025).name("Giro de la Pinza");
    h.add(effectController, "separacionPinza", 0.0, 15.0, 0.1).name("Separacion Pinza");*/
}
function updateAspectRatio()
{
    //Se diapara cuando se cambia el area de dibujo
    renderer.setSize(window.innerWidth, window.innerHeight);
    var ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}
var render = function ()
{
    requestAnimationFrame(render);
    update();
    renderer.clear();
    //Perfil
    renderer.setViewport(0,0,window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    //renderer.render(scene, camera);
    executeMovement();
}
initPhysicWorld();
init();
loadScene();
render();