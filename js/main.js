/**
 * Created by aghassaei on 1/7/15.
 */

//setup persistent global variables
if (typeof globals === "undefined") globals = {};


$(function(){

    //init web workers
//    window.workers = persistentWorkers(8);

    //init global singletons
    globals.three = new ThreeModel();
    globals.appState = new AppState();

    //ui
    new MenuWrapper({model: globals.appState});
    new NavBar({model:globals.appState});
    new Ribbon({model:globals.appState});

    //threeJS View
    new ThreeView({model:globals.three});

    //do stuff
    var plane = new Physijs.BoxMesh( // Physijs mesh
        new THREE.BoxGeometry(100, 100, 2, 10, 10), // Three.js geometry
        Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 0xeeeeee}), 0.4, 0.8), 0);
    globals.three.sceneAdd(plane);

    var numBalls = 50;
    makeBall();

    function makeBall() {
        var ball = new Physijs.SphereMesh(
            new THREE.SphereGeometry(Math.random() * (4 - 1) + 1, 16, 16),
            Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 0xff0000, reflectivity: .8}), 0.4, 0.6), 1);

        ball.position.x = Math.random()*10;
        ball.position.y = Math.random()*10;
        ball.position.z = 40;

        globals.three.sceneAdd(ball);
        if (numBalls-- > 0) setTimeout(makeBall, 600);
    }
});
