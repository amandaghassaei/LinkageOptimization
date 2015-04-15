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
        lastEvoTab: "physics",
        lastExportTab: "print",

        menuIsVisible: true,

        allMenuTabs: {
            navDesign:{
                drawParams:"Params",
                script:"Script"
            },
            navEvo:{
                physics:"Fitness",
                part:"Population",
                material:"Mutation",
                optimize:"Run"
            },
            navExport:{
                print: "3D Print",
                mill: "Mill"
            }
        },

        isHillClimbing: false,
        mutationRate: 0.05,

        is3D: false,
        isAnimating: true,//play/pause animation
        thetaStep: 0.02,

        linkWidth: 3,
        zDepth: 3

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

        this.downKeys = {};//track keypresses to prevent repeat keystrokes on hold
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
            this.get("lastDesignTab"), {silent:true});
        else if (navSelection == "navEvo") this.set("currentTab",
            this.get("lastEvoTab"), {silent:true});
        else if (navSelection == "navExport") this.set("currentTab",
            this.get("lastExportTab"), {silent:true});
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

    saveFile: function(data, name, extension){
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, name + extension);
    },

    saveJSON: function(name){
        if (!name) name = "linkage";
        var data = JSON.stringify({population:globals.population.toJSON()});
        this.saveFile(data, name, ".json");
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

    loadFileFromJSON: function(data){
        var json = JSON.parse(data);
        globals.population.setFromJSON(json.population);
    }

});