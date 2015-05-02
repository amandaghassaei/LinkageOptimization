/**
 * Created by aghassaei on 4/16/15.
 */


FitnessMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #stepNextGen":                                       "_stepNextGeneration",
        "change input:checkbox":                                    "_toggleCheckbox",
        "click #savePath":                                          "_saveTargetPath",
        "click #loadPath":                                          "_loadTargetPath",
        "click .saveOutputPath":                                    "_saveOutputPath",
        "change input[name=fitnessMetrics]":                        "_changeFitnessMetrics",
        "change input[name=terrainType]":                           "_changeTerrain",
        "change input[name=fitnessQuantity]":                       "_changeFitnessQuantity",
        "click #fitnessRunGA":                                      "_run",
        "click #fitnessPauseGA":                                    "_pause"
    },

    initialize: function(){

        _.bindAll(this, "render", "_onKeyup");

        //bind events
        $(document).bind('keyup', {}, this._onKeyup);
        this.listenTo(globals.appState, "change", this.render);

    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "fitness") return;

        if ($("input").is(":focus") && e.keyCode == 13) {//enter key
            $(e.target).blur();
            this.render();
            return;
        }

        if ($("#outputHingeIndex").is(":focus")) this._updateOutputHingeIndex(e);
        if ($(".numberInput").is(":focus")) this._updateNumber(e);
        if ($(".floatInput").is(":focus")) this._updateFloat(e);
    },

    _updateOutputHingeIndex: function(e){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        newVal = parseInt(newVal);
        if (newVal < 0) globals.error.throwError("index must be a positive integer");
        var property = $(e.target).data("type");
        globals.appState.set(property, newVal);
    },

    _updateNumber: function(e){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        newVal = parseInt(newVal);
        var property = $(e.target).data("type");
        globals.appState.set(property, newVal);
    },

    _updateFloat: function(e){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        newVal = parseFloat(newVal);
        var property = $(e.target).data("type");
        globals.appState.set(property, newVal);
    },

    _toggleCheckbox: function(e){
        this.model.set($(e.target).attr('id'), $(e.target).is(':checked'));
    },

    _saveTargetPath: function(e){
        e.preventDefault();
        globals.saveFile(JSON.stringify({
            path: globals.targetCurve
        }), "targetPath", ".json");
    },

    _saveOutputPath: function(e){
        e.preventDefault();
        globals.population.saveBestOutputPath();
    },

    _loadTargetPath: function(e){
        e.preventDefault();
        $("#fileInput").click();
    },

    _changeFitnessMetrics: function(e){
        var val = $(e.target).val();
        if (val == "walking"){
            globals.appState.set("fitnessBasedOnTargetPath", false);
        } else if (val == "targetPath"){
            globals.appState.set("fitnessBasedOnTargetPath", true);
        } else console.warn("unknown fitness metric " + val);
    },

    _changeTerrain: function(e){
        var val = $(e.target).val();
        if (val == "flat" || val == "incline" || val == "obstacles"){
            globals.appState.set("terrain", val);
        } else console.warn("unknown terrain type " + val);
    },

    _changeFitnessQuantity: function(e){
        var val = $(e.target).val();
        if (val == "distance" || val == "speed"){
            globals.appState.set("fitnessQuantity", val);
        } else console.warn("unknown fitness metric " + val);
    },

    _run: function(e){
        e.preventDefault();
        globals.appState.set("isRunning", true);
        globals.population.run();
    },

    _pause: function(e){
        e.preventDefault();
        globals.appState.set("isRunning", false);
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "fitness") return;
        if ($(".numberInput").is(":focus")) return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        Fitness Metrics:\
        <label class="radio">\
        <input type="radio" name="fitnessMetrics" <% if (!fitnessBasedOnTargetPath){ %> checked <% } %> value="walking" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Obstacle Course (Walking) <a class="helpModal" data-type="walkingMetric" href="#">( ? )</a>\
        </label>\
        <label class="radio">\
        <input type="radio" name="fitnessMetrics" <% if (fitnessBasedOnTargetPath){ %>checked <% } %> value="targetPath" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Target Path Fit <a class="helpModal" data-type="targetPathMetric" href="#">( ? )</a>\
        </label><br/>\
        <% if (fitnessBasedOnTargetPath){ %>\
            Output Hinge Index: &nbsp;&nbsp;<input id="outputHingeIndex" data-type="outputHingeIndex" value="<%= outputHingeIndex %>" placeholder="Hinge" class="form-control numberInput" type="text"> <a class="helpModal" data-type="outputHinge" href="#">( ? )</a><br/><br/>\
            <!--Num Trajectory Samples: &nbsp;&nbsp;<input data-type="numPositionSteps" value="<%= numPositionSteps %>" placeholder="Num Samples" class="form-control numberInput" type="text"><br/><br/>-->\
            <a href="#" id="loadPath" class="btn btn-block btn-lg btn-default">Load Target Path</a><br/>\
            <a href="#" id="savePath" class=" btn pull-left btn-halfWidth btn-lg btn-default">Save Target Path</a>\
            <a href="#" class="saveOutputPath btn pull-right btn-halfWidth btn-lg btn-default">Save Best Output Path</a><br/><br/>\
            <label class="checkbox" for="showTargetPath">\
            <input type="checkbox" <% if (showTargetPath){ %>checked="checked" <% } %> value="" id="showTargetPath" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Show target path</label>\
            <label class="checkbox" for="showOutputPath">\
            <input type="checkbox" <% if (showOutputPath){ %>checked="checked" <% } %> value="" id="showOutputPath" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Show output hinge trajectory</label>\
        <% } else { %>\
            Num Leg Pairs: &nbsp;&nbsp;<input id="numLegPairs" data-type="numLegPairs" value="<%= numLegPairs %>" placeholder="Num Pairs" class="form-control numberInput" type="text"> <a class="helpModal" data-type="numLegPairs" href="#">( ? )</a><br/>\
            <label class="checkbox" for="flipVertical">\
            <input type="checkbox" <% if (flipVertical){ %>checked="checked" <% } %> value="" id="flipVertical" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Flip Vertically</label><br/>\
            Terrain: <a class="helpModal" data-type="terrainType" href="#">( ? )</a>\
            <label class="radio">\
            <input type="radio" name="terrainType" <% if (terrain == "flat"){ %> checked <% } %>value="flat" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Flat\
            </label>\
            <label class="disabled radio">\
            <input type="radio"  disabled name="terrainType" <% if (terrain == "incline"){ %>checked <% } %>value="incline" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Inclines/Declines\
            </label>\
            <label class="disabled radio">\
            <input type="radio" disabled name="terrainType" <% if (terrain == "obstacles"){ %>checked <% } %>value="obstacles" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Obstacles\
            </label><br/>\
            Eval Period (# of simulation ticks): &nbsp;&nbsp;<input id="numEvalTicks" data-type="numEvalTicks" value="<%= numEvalTicks %>" placeholder="Eval Ticks" class="form-control numberInput" type="text"> <a class="helpModal" data-type="evalPeriod" href="#">( ? )</a><br/>\
            <label class="radio">\
            <input type="radio" name="fitnessQuantity" <% if (fitnessQuantity == "distance"){ %> checked <% } %>value="distance" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Distance Traversed\
            </label>\
            <label class="radio">\
            <input type="radio"  name="fitnessQuantity" <% if (fitnessQuantity == "speed"){ %>checked <% } %>value="speed" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Final Speed\
            </label>\
            Friction (between 0 and 1): &nbsp;&nbsp;<input id="friction" data-type="friction" value="<%= friction %>" placeholder="Friction" class="form-control floatInput" type="text"> <a class="helpModal" data-type="friction" href="#">( ? )</a><br/><br/>\
            <!--<a href="#" class="saveOutputPath btn btn-block btn-lg btn-default">Save Best Output Path</a><br/>-->\
             <% if (isRunning) { %>\
            <a href="#" id="fitnessPauseGA" class="btn-warning btn btn-block btn-lg btn-default">Pause Run</a><br/>\
            <% } else { %>\
            <a href="#" id="fitnessRunGA" class="btn-success btn btn-block btn-lg btn-default">Run</a><br/>\
            <% } %>\
        <% } %>\
        ')
});




