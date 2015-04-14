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
    globals.population = new Population();

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
