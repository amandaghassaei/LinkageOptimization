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
                physics:"Physics",
                part:"Part",
                material:"Material",
                optimize:"Optimize"
            },
            navExport:{
                print: "3d Print",
                mill: "Mill"
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

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////KEY BINDINGS//////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    _handleKeyStroke: function(e){//receives keyup and keydown

        if ($("input").is(':focus')) return;//we are typing in an input

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