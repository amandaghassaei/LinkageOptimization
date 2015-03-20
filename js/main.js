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
        Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 0xeeeeee}),
            .4, // friction
            .8 // restitution
        ),
        0 // weight, 0 is for zero gravity
    );
    globals.three.sceneAdd(plane);

    setInterval(function() {
      var ball = new Physijs.SphereMesh(
        new THREE.SphereGeometry(
          Math.random() * (4 - 1) + 1,
          16,
          16
        ),
        Physijs.createMaterial(
          new THREE.MeshLambertMaterial({
            color: 0xff0000,
            reflectivity: .8
          }),
          .4,
          .6
        ),
        1
      );

      var r = {
        x: Math.random() * (Math.PI - Math.PI / 12) + Math.PI / 12,
        y: Math.random() * (Math.PI - Math.PI / 12) + Math.PI / 12,
        z: Math.random() * (Math.PI - Math.PI / 12) + Math.PI / 12
      };

      ball.rotation.set(r.x, r.y, r.z);
      ball.position.y = 40;
      ball.castShadow = true;
      ball.receiveShadow = true;

      globals.three.sceneAdd(ball);
    }, 600);

    globals.three.render();
    globals.three.simulate();

//    var cube = new THREE.Mesh(new THREE.BoxGeometry(40,40,40), new THREE.MeshNormalMaterial());
//    globals.three.sceneAdd(cube);
//    globals.three.render();

});
