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
    var cube = new THREE.Mesh(new THREE.BoxGeometry(40,40,40), new THREE.MeshNormalMaterial());
    globals.three.sceneAdd(cube);

});
