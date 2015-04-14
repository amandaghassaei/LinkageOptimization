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

    var linkage = new Linkage();
    var hinge1 = linkage.addHingeAtPosition({x:0,y:20});
    var hinge2 = linkage.addHingeAtPosition({x:0,y:-20});
    var hinge3 = linkage.addHingeAtPosition({x:-10,y:0});
    var hinge4 = linkage.addHingeAtPosition({x:14,y:0}).setStatic(true);
    var hinge5 = linkage.addHingeAtPosition({x:-20,y:0});

    linkage.link(hinge1, hinge3);//add an optional third param to set to a specific length
    linkage.link(hinge3, hinge2);
    linkage.link(hinge2, hinge4);
    linkage.link(hinge4, hinge1);
    var link35 = linkage.link(hinge3, hinge5);
    linkage.addDriveCrank(hinge5, hinge3, link35.getLength());

    globals.population = new Population([linkage]);

    //ui
    new MenuWrapper({model: globals.appState});
    new NavBar({model:globals.appState});
    new Ribbon({model:globals.appState});




    //the lack of indenting is on purpose - looks weird in the script editor otherwise
globals.script = function(){
    //nothing here for now
};

//    globals.script();

    //threeJS View
    new ThreeView({model:globals.three});

});
