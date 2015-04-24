/**
 * Created by aghassaei on 1/7/15.
 */

//setup persistent global variables
if (typeof globals === "undefined") globals = {};


$(function(){

    //init web workers
//    window.workers = persistentWorkers(8);

    console.log(window.location.href);
//    $(window).bind('beforeunload', function(){
//      return 'Are you sure you want to leave?';
//    });

    globals.saveFile = function(data, name, extension){
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, name + extension);
    };

    globals.setTargetCurve = function(curve){
        var cumulativeX = 0;
        var cumulativeY = 0;
        _.each(curve, function(point){
            cumulativeX += point.x;
            cumulativeY += point.y;
        });
        var centerX = cumulativeX/curve.length;
        var centerY = cumulativeY/curve.length;
        _.each(curve, function(point){
            point.x -= centerX;
            point.y -= centerY;
        })
        globals.targetCurve = curve;
    };

    //init global singletons
    globals.runStatistics = [];
    globals.three = new ThreeModel();
    globals.physics = new PhysicsModel();
    globals.appState = new AppState();
    globals.setTargetCurve([
        {x:10.0,y:0.0},{x:7.071,y:7.071},
        {x:0.0,y:10.0},{x:-7.071,y:7.071},
        {x:-10.0,y:0.0},{x:-7.071,y:-7.071},
        {x:0.0,y:-10.0},{x:7.071,y:-7.071}]);
    globals.population = new Population();
    globals.population.init();

    //ui
    new MenuWrapper({model: globals.appState});
    globals.error = new MenuErrorView();
    new NavBar({model:globals.appState});
//    new Ribbon({model:globals.appState});


    //the lack of indenting is on purpose - looks weird in the script editor otherwise
globals.script = function(){
    //nothing here for now
};
    new ScriptMenuView({model:globals.appState});

//    globals.script();

    //threeJS View
    new ThreeView({model:globals.three});

});
