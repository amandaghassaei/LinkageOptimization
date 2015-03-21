/**
 * Created by aghassaei on 1/29/15.
 */

//a class to store global app state

AppState = Backbone.Model.extend({

    defaults: {

        currentNav:"navDesign",// design, sim, assemble
        currentTab:"lattice",

        //last tab that one open in each of the main menus
        lastDesignTab: "lattice",
        lastSimulationTab: "physics",
        lastAssembleTab: "assembler",

        menuIsVisible: true,

        allMenuTabs: {
            navDesign:{
                lattice:"Lattice",
                import:"Import",
                sketch:"Sketch",
                part:"Part",
                script:"Script"
            },
            navSim:{
                physics:"Physics",
                part:"Part",
                material:"Material",
                optimize:"Optimize"
            },
            navAssemble:{
                assembler:"Assembler",
                cam: "Process",
                animate:"Preview",
                send: "Send"
            }
        },

        is3D: false,
        isAnimating: true,//play/pause animation
        thetaStep: 0.01

    },

    initialize: function(){

         _.bindAll(this, "_handleKeyStroke", "_handleScroll");

        //bind events
        $(document).bind('keydown', {state:true}, this._handleKeyStroke);
        $(document).bind('keyup', {state:false}, this._handleKeyStroke);
        $(document).bind('mousewheel', {}, this._handleScroll);

        this.listenTo(this, "change:currentTab", this._tabChanged);
        this.listenTo(this, "change:currentNav", this._updateCurrentTabForNav);

        this.downKeys = {};//track keypresses to prevent repeat keystrokes on hold

        if (this.isMobile()) this.set("menuIsVisible", false);
    },

    isMobile: function() {
        return (window.innerWidth <= 700);
    },


    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////EVENTS////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////


    _tabChanged: function(){
        var currentTab = this.get("currentTab");
        this._storeTab(this.get("currentNav"), currentTab);
    },

    _storeTab: function(currentNav, currentTab){
        if (currentNav == "navDesign") this.set("lastDesignTab", currentTab);
        else if (currentNav == "navSim") this.set("lastSimulationTab", currentTab);
        else if (currentNav == "navAssemble") this.set("lastAssembleTab", currentTab);
    },

    //update to last tab open in that section
    _updateCurrentTabForNav: function(){
        var navSelection = this.get("currentNav");
        if (navSelection == "navDesign") this.set("currentTab",
            this.get("lastDesignTab"), {silent:true});
        else if (navSelection == "navSim") this.set("currentTab",
            this.get("lastSimulationTab"), {silent:true});
        else if (navSelection == "navAssemble") this.set("currentTab",
            this.get("lastAssembleTab"), {silent:true});
    },

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////KEY BINDINGS//////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    _handleKeyStroke: function(e){//receives keyup and keydown

        if ($("input").is(':focus')) return;//we are typing in an input
        if ($("textarea").is(':focus')) return;//we are typing in an input

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
                    $("#jsonInput").click();
                }
                break;
            default:
                break;
        }
    },

    _handleScroll: function(e){//disable two finger swipe back
        if (Math.abs(e.originalEvent.deltaX) > Math.abs(e.originalEvent.deltaY)) e.preventDefault();
    },

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////SAVE////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    _saveFile: function(data, name, extension){
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, name + extension);
    },

    saveJSON: function(name){
        if (!name) name = "defaultName";
        var data = JSON.stringify(globals.linkage.toJSON());
        this._saveFile(data, name, ".json");
    },

    loadFileFromJSON: function(data){
        this._setData(JSON.parse(data));q
    },

    _setData: function(data){
        _.each(_.keys(data), function(key){
            //save keys
        });
    }

});