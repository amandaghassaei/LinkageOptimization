/**
 * Created by aghassaei on 1/7/15.
 */

//setup persistent global variables
if (typeof globals === "undefined") globals = {};


$(function(){

    //init web workers
//    window.workers = persistentWorkers(8);

    if (window.location.href == "http://amandaghassaei.github.io/LinkageOptimization/"){
        $(window).bind('beforeunload', function(){
          return 'Are you sure you want to leave?';
        });
    }

    globals.saveFile = function(data, name, extension){
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, name + extension);
    };

    globals.setTargetCurve = function(curve){
        // var cumulativeX = 0;
        // var cumulativeY = 0;
        // _.each(curve, function(point){
        //     cumulativeX += point.x;
        //     cumulativeY += point.y;
        // });
        // var centerX = cumulativeX/curve.length;
        // var centerY = cumulativeY/curve.length;
        // _.each(curve, function(point){
        //     point.x -= centerX;
        //     point.y -= centerY;
        // });
        
        var params = Linkage.prototype.getTranslationScaleRotation(curve);
        // console.log('params', params);
        globals.targetCurve = Linkage.prototype.normalizeTrajectory(curve, params);
        // console.log('curve', globals.targetCurve);
        // globals.targetCurve = curve;
    };

    //init global singletons
    globals.runStatistics = [];
    globals.three = new ThreeModel();
    globals.physics = new PhysicsModel();
    globals.appState = new AppState();
    globals.setTargetCurve(
        [{"x":-5.117309897530315,"y":38.32711477748931},{"x":-2.5985331618740974,"y":39.4059660955054},{"x":0.010781423609685009,"y":40.35069724679184},{"x":2.608726481663376,"y":41.13183667124075},{"x":5.02910474553677,"y":41.6825724316769},{"x":7.050434639135362,"y":41.99144935049261},{"x":8.458260462841816,"y":42.11272663973869},{"x":9.117505652860057,"y":42.16649874867241},{"x":9.010498015962812,"y":42.28704365692919},{"x":8.208387380175102,"y":42.5530608574297},{"x":6.827527168432659,"y":42.95061803241977},{"x":5.011670907813091,"y":43.386714726591535},{"x":2.926208147629733,"y":43.736603997423416},{"x":0.7392208254194652,"y":43.89592094990653},{"x":-1.40074689356929,"y":43.81063486116941},{"x":-3.398164796407791,"y":43.48756777097381},{"x":-5.198367107167615,"y":42.98882559190768},{"x":-6.793887611720229,"y":42.37966741118078},{"x":-8.209464118581131,"y":41.71743970950435},{"x":-9.486695393739035,"y":41.03461071178208},{"x":-10.67426487325882,"y":40.336495373360314},{"x":-11.816292041118256,"y":39.6125645335109},{"x":-12.950958070059185,"y":38.85217220637908},{"x":-14.07736706320837,"y":38.03654393534095},{"x":-15.201603004543054,"y":37.17131018890068},{"x":-16.309901539440943,"y":36.26426129214647},{"x":-17.36767731760639,"y":35.326352761545486},{"x":-18.354553553410167,"y":34.384773547514236},{"x":-19.242312474058465,"y":33.46381735159702},{"x":-20.010924021158623,"y":32.58900946101975},{"x":-20.64864291268287,"y":31.78117033284318},{"x":-21.152220884900455,"y":31.056442076056484},{"x":-21.52809311621559,"y":30.41827560430748},{"x":-21.77745341116695,"y":29.8828241822961},{"x":-21.915662567080673,"y":29.432094783227093},{"x":-21.943547029437084,"y":29.084772164357837},{"x":-21.86446018545663,"y":28.83985363033756},{"x":-21.67590127366643,"y":28.70369676108183},{"x":-21.366150784798688,"y":28.7041001574426},{"x":-20.927905272074295,"y":28.839953202980567},{"x":-20.350913696622253,"y":29.11798354694565},{"x":-19.62528616638187,"y":29.54222269009559},{"x":-18.742220383097283,"y":30.11183436212538},{"x":-17.69318321411022,"y":30.821965214455684},{"x":-16.469480657963704,"y":31.663526419320142},{"x":-15.06244387880478,"y":32.62258328464157},{"x":-13.46308826548173,"y":33.66041265330758},{"x":-11.669565654381119,"y":34.79932197372232},{"x":-9.6728426585985,"y":35.98470061931007},{"x":-7.481047074410466,"y":37.173575688524956}]
        // {x:8, y:6},
        // {x:7, y:0},
        // {x:3, y:-4},
        // {x:0, y:-6},
        // {x:-8, y:-6},
        // {x:-7, y:0},
        // {x:-3, y:-4},
        // {x:0, y:6}
        // {x:10.0,y:0.0},{x:7.071,y:7.071},
        // {x:0.0,y:10.0},{x:-7.071,y:7.071},
        // {x:-10.0,y:0.0},{x:-7.071,y:-7.071},
        // {x:0.0,y:-10.0},{x:7.071,y:-7.071}
    );
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
