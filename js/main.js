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
    globals.physics = new PhysicsModel();
    globals.appState = new AppState();
    globals.linkage = new Linkage();

    //ui
    new MenuWrapper({model: globals.appState});
    new NavBar({model:globals.appState});
    new Ribbon({model:globals.appState});

    //do stuff
    var hinge1 = globals.linkage.addHingeAtPosition(new THREE.Vector2(1,5));
    var hinge2 = globals.linkage.addHingeAtPosition(new THREE.Vector2(-3,10));
    globals.linkage.link(hinge1, hinge2, 10);
    //hinge2.setStatic(false);

    //threeJS View
    new ThreeView({model:globals.three});

    globals.physics.run();//start physics engine

});
