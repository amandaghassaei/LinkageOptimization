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
    globals.appState.delayedInit();


    //ui
    new NavBar({model:globals.appState});
    new Ribbon({model:globals.appState});

    //threeJS View
    new ThreeView({model:globals.three, appState:globals.appState});

    //do stuff

});
