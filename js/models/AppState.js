/**
 * Created by aghassaei on 1/29/15.
 */

//a class to store global app state

AppState = Backbone.Model.extend({

    defaults: {

        currentNav:"navDesign",// design, evo, export
        currentTab:"drawParams",

        //last tab that one open in each of the main menus
        lastDesignTab: "drawParams",
        lastEvoTab: "population",
        lastExportTab: "print",

        menuIsVisible: true,
        scriptMenuIsVisible: true,

        allMenuTabs: {
            navDesign:{
                drawParams:"View",
                population:"Population",
                fitness:"Fitness",
                mutation:"Mutation",
                run:"Run"
            },
            navEvo:{
            },
            navExport:{
                print: "3D Print",
                mill: "Mill"
            }
        },

        isHillClimbing: false,
        isNelderMead: false,
        mutationRate: 5,//percent
        fitnessBasedOnTargetPath: true,

        is3D: false,
        isAnimating: true,//play/pause animation
        numPositionSteps: 50,
        phase: 25,
        shouldAutoUpdatePhase: true,
        shouldRenderPhaseChange: false,

        linkWidth: 3,
        zDepth: 3,

        //view
        showHingePaths: false,
        showOutputPath: true,//output hinge
        showTargetPath: true,
        shouldRenderThreeJS: true,

        populationSize: 20,
        minLinkLength: 5,
        maxLinkChange: 25,//percent
        outputHingeIndex: 1,

        isRunning:false//play/pause optimization

    },

    initialize: function(){

         _.bindAll(this, "_handleKeyStroke", "_handleScroll");

        //bind events
        $(document).bind('keydown', {state:true}, this._handleKeyStroke);
        $(document).bind('keyup', {state:false}, this._handleKeyStroke);
        $(document).bind('mousewheel', {}, this._handleScroll);

        this.listenTo(this, "change:currentTab", this._tabChanged);
        this.listenTo(this, "change:currentNav", this._updateCurrentTabForNav);

        //bind events
        this.listenTo(this, "change:linkWidth", this._setWidth);
        this.listenTo(this, "change:zDepth", this._setDepth);
        this.listenTo(this, "change:is3D", this._setDepth);
        this.listenTo(this, "change:populationSize", this._populationSizeChanged);
        this.listenTo(this, "change:showHingePaths", this._showHingePaths);
        this.listenTo(this, "change:showOutputPath", this._showOutputPaths);
        this.listenTo(this, "change:showTargetPath", this._showTargetPath);
        this.listenTo(this, "change:isHillClimbing", this._hillClimbingMode);
        this.listenTo(this, "change:outputHingeIndex", this._changeOutputHinge);
        this.listenTo(this, "change:isAnimating", this._startStopAnimation);

        this.downKeys = {};//track keypresses to prevent repeat keystrokes on hold
    },




    //Events

    _populationSizeChanged: function(){
        globals.population.reset()
    },

    _showHingePaths: function(){
        globals.population.setHingePathVisibility(this.get("showHingePaths"));
        this._showOutputPaths();
    },

    _showOutputPaths: function(){
        if (!this.get("showOutputPath") && this.get("showHingePaths")) return;
        globals.population.setOutputPathVisibility(this.get("showOutputPath"));
    },

    _showTargetPath: function(){
        globals.population.setTargetPathVisibility(this.get("showTargetPath"));
    },

    _hillClimbingMode: function(){
        globals.population.reset(globals.population.getBestLinkage());
    },

    _changeOutputHinge: function(){
        globals.population.setHingePathVisibility(false);
        this._showOutputPaths();
    },

    changePhase: function(phase){
        this.set("shouldAutoUpdatePhase", false, {silent:true});
        this.set("isAnimating", false);
        this.set("isRunning", false);
        globals.population.setPhase(phase);
        this.set("shouldRenderPhaseChange", true, {silent:true});
    },

    _startStopAnimation: function(){
        if (this.get("isAnimating")) this.set("shouldAutoUpdatePhase", true);
    },



    //Draw

    _setWidth: function(){
        globals.population.setWidth(this.get("linkWidth"));
    },

    _setDepth: function(){
        globals.population.setDepth(this.getDepth());
    },

    getDepth: function(){
        if (!globals.appState.get("is3D")) return 0.000001;
        return this.get("zDepth");
    },



    //UI Events

    _tabChanged: function(){
        var currentTab = this.get("currentTab");
        this._storeTab(this.get("currentNav"), currentTab);
        if (currentTab == "fitness") {
            globals.population.setHingePathVisibility(false);
            this._showOutputPaths();
        }
        else this._showHingePaths();
    },

    _storeTab: function(currentNav, currentTab){
        if (currentNav == "navDesign") this.set("lastDesignTab", currentTab);
        else if (currentNav == "navEvo") this.set("lastEvoTab", currentTab);
        else if (currentNav == "navExport") this.set("lastExportTab", currentTab);
    },

    //update to last tab open in that section
    _updateCurrentTabForNav: function(){
        var navSelection = this.get("currentNav");
        if (navSelection == "navDesign") this.set("currentTab",
            this.get("lastDesignTab"));
        else if (navSelection == "navEvo") this.set("currentTab",
            this.get("lastEvoTab"));
        else if (navSelection == "navExport") this.set("currentTab",
            this.get("lastExportTab"));
    },




    //Key Bindings

    _handleKeyStroke: function(e){//receives keyup and keydown

        if ($("input").is(':focus')) return;//we are typing in an input
        if ($(".CodeMirror-focused").length>0) return;//editing script

        var state = e.data.state;
        var currentTab = this.get("currentTab");

        if (e.ctrlKey || e.metaKey){
        } else if (state) {
            if (this.downKeys[e.keyCode]) return;
            this.downKeys[e.keyCode] = true;
        } else this.downKeys[e.keyCode] = false;

//        console.log(e);
//        console.log(e.keyCode);
        switch(e.keyCode){
            case 32://space bar (play/pause)
                e.preventDefault();
                if (state) this.set("isAnimating", !this.get("isAnimating"));
                break;
            case 50://2 key
                e.preventDefault();
                this.set("is3D", false);
                break;
            case 51://3 key
                e.preventDefault();
                this.set("is3D", true);
                break;
            case 83://s save
                if (e.ctrlKey || e.metaKey){//command
                    e.preventDefault();
                    if (e.shiftKey){
                        $("#saveAsModel").modal("show");
                    } else {
                        this.saveJSON();
                    }
                } else {//s script menu
                    if (!state) this.set("scriptMenuIsVisible", !this.get("scriptMenuIsVisible"));
                }
                break;
            case 79://o open
                if (e.ctrlKey || e.metaKey){//command
                    e.preventDefault();
                    $("#fileInput").click();
                }
                break;
            default:
                break;
        }
    },

    _handleScroll: function(e){//disable two finger swipe back
        if (Math.abs(e.originalEvent.deltaX) > Math.abs(e.originalEvent.deltaY)) e.preventDefault();
    },




    //Open/Save

    saveJSON: function(name){
        if (!name) name = "run";
        var data = JSON.stringify({
            run:{
                appState: {
                    isHillClimbing: this.get("isHillClimbing"),
                    isNelderMead: this.get("isNelderMead"),
                    linkWidth: this.get("linkWidth"),
                    maxLinkChange: this.get("maxLinkChange"),
                    minLinkLength: this.get("minLinkLength"),
                    mutationRate: this.get("mutationRate"),
                    numPositionSteps: this.get("numPositionSteps"),
                    outputHingeIndex: this.get("outputHingeIndex"),
                    populationSize: this.get("populationSize"),
                    showHingePaths: this.get("showHingePaths"),
                    showOutputPath: this.get("showOutputPath"),
                    showTargetPath: this.get("showTargetPath"),
                    zDepth: this.get("zDepth"),
                    fitnessBasedOnTargetPath: this.get("fitnessBasedOnTargetPath")
                },
                runStatistics: globals.runStatistics,
                population: globals.population.toJSON(),
                targetCurve: globals.targetCurve
            }
        });
        globals.saveFile(data, name, ".json");
    },

    syncScript: function(script){
        eval("globals.script =" + script);
    },

    loadScript: function(script){
        this.syncScript(script);
        this.runScript();
        globals.codeMirror.setValue(script);
    },

    runScript: function(script){
        globals.population.clearAll();
        if (script) this.syncScript(script);
        globals.script();
        this.set("isAnimating", true);
    },

    loadRunFromJSON: function(json){
        globals.population.clearAll();
        globals.setTargetCurve(json.targetCurve);
        globals.runStatistics = json.runStatistics;
        _.each(_.keys(json.appState), function(key){
            globals.appState.set(key, json.appState[key], {silent:true});
        });
        globals.appState.set("isRunning", false);
        globals.appState.set("isAnimating", true);
        globals.appState.trigger("change");
        globals.population.setFromJSON(json.population);
    }

});