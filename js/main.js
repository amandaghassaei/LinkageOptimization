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
    var hinge1 = globals.linkage.addHingeAtPosition(new THREE.Vector2(0,20));
    var hinge2 = globals.linkage.addHingeAtPosition(new THREE.Vector2(0,-20));
    var hinge3 = globals.linkage.addHingeAtPosition(new THREE.Vector2(-10,0));
    var hinge4 = globals.linkage.addHingeAtPosition(new THREE.Vector2(14,0));
    hinge4.setStatic(true);
    var hinge5 = globals.linkage.addHingeAtPosition(new THREE.Vector2(-20,0));

    globals.linkage.link(hinge1, hinge3);
    globals.linkage.link(hinge3, hinge2);
    globals.linkage.link(hinge2, hinge4);
    globals.linkage.link(hinge4, hinge1);
    var link35 = globals.linkage.link(hinge3, hinge5);
    globals.linkage.addDriveCrank(hinge5, hinge3, link35);

    //threeJS View
    new ThreeView({model:globals.three});

    globals.physics.run();//start physics engine


});
