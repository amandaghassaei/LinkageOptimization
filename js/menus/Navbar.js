/**
 * Created by aghassaei on 1/7/15.
 */


//model is appState
//not templating this view yet

NavBar = Backbone.View.extend({

    el: "body",

    events: {
        "click #showHideMenu":                                  "_setMenuVis",
        "click .menuHoverControls":                             "_setNavSelection",
        "click #saveJSON":                                      "_save",
        "click #saveAsJSON":                                    "_saveAs",
        "change #saveAsModel":                                  "_saveAs",
        "click #saveUser":                                      "_saveUserSettings",
        "shown.bs.modal .modal":                                "_showModal",
        "hide.bs.modal .modal":                                 "_hideModal",
        "click .importJSON":                                    "_importJSON",
        "change #fileInput":                                    "_selectJSONFiles",
        "click #navSavePath":                                   "_saveTargetPath",
        "click #saveRunStats":                                  "_saveRunStats"
    },

    initialize: function(){

        _.bindAll(this, "_setMenuVis", "_setNavSelection", "_handleKeyStroke");

        //bind events
        this.listenTo(this.model, "change:menuIsVisible", this._updateShowHideButton);
        this.listenTo(this.model, "change:currentNav", this._updateNavSelectionUI);
        $(document).bind('keyup', this._handleKeyStroke);

        this._updateShowHideButton();
        this._updateNavSelectionUI();
    },

    _handleKeyStroke: function(e){
        if ($("#saveAsFileName").is(":focus")){
            e.preventDefault();
            this._saveAs(e);
        }
    },

    _setMenuVis: function(e){
        e.preventDefault();
        var state = this.model.get("menuIsVisible");
        this.model.set("menuIsVisible", !state);
        $(e.target).blur();
    },

    _updateShowHideButton: function(){
        var $button = $("#showHideMenu");
        var state = this.model.get("menuIsVisible");
        if(state){
            $button.html("Hide Menu >>");
        } else {
            $button.html("<< Show Menu");
        }
    },

    _setNavSelection: function(e){
        var navSelection = $(e.target).data("menuId");
        if (navSelection == "about") {
            $(e.target).blur();
            return;
        }
        e.preventDefault();
        if (navSelection) this.model.set("currentNav", navSelection);
    },

    _updateNavSelectionUI: function(){
        this._deselectAllNavItems();
        var navSelection = this.model.get("currentNav");
        _.each($(".menuHoverControls"), function(link){
            var $link = $(link);
            if ($link.data("menuId") == navSelection) $link.parent().addClass("open");//highlight
        });
    },

    _importJSON: function(e){
        e.preventDefault();
        $("#fileInput").click();
    },

    _selectJSONFiles: function(e){
        e.preventDefault();
        var input = $(e.target),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        this._readDataURL(numFiles, label, input.get(0).files);
        input.val("");
    },

    _readDataURL: function(numFiles, filename, files){
        if (numFiles>1) console.warn("too many files selected");
        var reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onload = (function() {
            return function(e) {
                var fileParts = filename.split(".");
                var extension = fileParts[fileParts.length -1];
                if (extension == "json"){
                    var json = JSON.parse(e.target.result);
                    if (json.path){
                        globals.targetCurve = json.path;
                        globals.population.newTargetPathLoaded();
                    } else {
                        globals.appState.loadFileFromJSON(e.target.result);
                    }
                } else if (extension == "js"){
                    globals.appState.loadScript(e.target.result);
                } else console.warn("file type not recognized");
            }
        })();
    },

    _saveTargetPath: function(e){
        e.preventDefault();
        globals.saveFile(JSON.stringify({
            path: globals.targetCurve
        }), "targetPath", ".json");
    },

    _saveRunStats: function(e){
        e.preventDefault();
        globals.runStatistics.push(globals.population.getCurrentStatistics());//save current generation
        globals.saveFile(JSON.stringify({
            numGenerations:globals.runStatistics.length,
            mutationRatePercent:globals.appState.get("mutationRate"),
            populationSize:globals.appState.get("populationSize"),
            isHillClimbing: globals.appState.get("isHillClimbing"),
            minLinkLength: globals.appState.get("minLinkLength"),
            maxLinkChangePercent: globals.appState.get("maxLinkChange"),
            data:globals.runStatistics
        }), "runStatistics", ".json");
    },

    _save: function(e){
        e.preventDefault();
        globals.appState.saveJSON();
    },

    _saveAs: function(e){
        e.preventDefault();
        var fileName = $("#saveAsFileName").val();
        globals.appState.saveJSON(fileName);
        $('#saveAsModel').modal('hide');
    },

    _showModal: function(e){
        var input = $(e.target).find("input.filename");
        input.focus();
        input.select();
    },

    _hideModal: function(e){
        $(e.target).find("input.filename").blur();
    },

    _deselectAllNavItems: function(){
        $(".open").removeClass("open");//no highlight
    }

});