/**
 * Created by aghassaei on 4/16/15.
 */


/**
 * Created by aghassaei on 4/16/15.
 */


RunMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "change input:checkbox":                                    "_toggleCheckbox",
        "click #runGA":                                             "_runGA",
        "click #pauseGA":                                           "_pauseGA",
        "click #runStepNextGen":                                    "_stepNextGeneration",
        "click #runReset":                                          "_reset",
        "change .numberInput":                                      "_updateNumber"
    },

    initialize: function(){

        _.bindAll(this, "render", "_onKeyup", "_setGenerationStats");

        //bind events
        $(document).bind('keyup', {}, this._onKeyup);
        this.listenTo(globals.appState, "change", this.render);

        $("body").bind("generationIncr", this._setGenerationStats);
    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "run") return;

        if ($("input").is(":focus") && e.keyCode == 13) {//enter key
            $(e.target).blur();
            this.render();
            return;
        }

//        if ($(".numberInput").is(":focus")) this._updateNumber(e);
    },

    _updateNumber: function(e){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        newVal = parseInt(newVal);
        var property = $(e.target).data("type");
        globals.appState.set(property, newVal);
    },

    _toggleCheckbox: function(e){
        this.model.set($(e.target).attr('id'), $(e.target).is(':checked'));
    },

    _runGA: function(e){
        e.preventDefault();
        globals.appState.set("isRunning", true);
        globals.population.run();
    },

    _pauseGA: function(e){
        e.preventDefault();
        globals.appState.set("isRunning", false);
    },

    _reset: function(e){
        e.preventDefault();
        globals.population.reset();
    },

    _stepNextGeneration: function(e){
        e.preventDefault();
        globals.population.step();
    },

    _setGenerationStats: function(){
        $("#generationNum").html(globals.runStatistics.length);
        if (globals.runStatistics.length == 0){
            $("#bestFitness").html("null");
            $("#worstFitness").html("null");
            $("#avgFitness").html("null");
            return;
        }
        var currentGen = globals.runStatistics[globals.runStatistics.length-1];
        if (currentGen.maxFitness) $("#bestFitness").html(currentGen.maxFitness.toFixed(2));
        if (currentGen.minFitness) $("#worstFitness").html(currentGen.minFitness.toFixed(2));
        if (currentGen.avgFitness) $("#avgFitness").html(currentGen.avgFitness.toFixed(2));
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "run") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(this.model.toJSON()));
        this._setGenerationStats();
    },

    template: _.template('\
        <% if (isRunning) { %>\
        <a href="#" id="pauseGA" class="btn-warning btn btn-block btn-lg btn-default">Pause Run</a><br/>\
        <% } else  { %>\
        <a href="#" id="runGA" class="btn-success btn btn-block btn-lg btn-default">Run</a><br/>\
        <a href="#" id="runStepNextGen" class="btn btn-block btn-lg btn-default">Step to Next Generation</a><br/>\
        <a href="#" id="runReset" class="btn btn-block btn-lg btn-default">Reset</a><br/>\
        <% } %>\
        <label class="checkbox" for="shouldRenderThreeJS">\
        <input type="checkbox" <% if (shouldRenderThreeJS){ %>checked="checked" <% } %> value="" id="shouldRenderThreeJS" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Render linkages during run (less efficient)</label>\
        Max Num Generations (-1 never stops): &nbsp;&nbsp;<input data-type="maxNumGenerations" value="<%= maxNumGenerations %>" placeholder="Max Gens" class="form-control numberInput" type="text"><br/><br/>\
        Current Generation: &nbsp;&nbsp;<span id="generationNum"></span><br/>\
        Best Fitness: &nbsp;&nbsp;<span id="bestFitness"></span><br/>\
        <% if (!isHillClimbing){ %>\
        Average Fitness: &nbsp;&nbsp;<span id="avgFitness"></span><br/>\
        Worst Fitness: &nbsp;&nbsp;<span id="worstFitness"></span><br/>\
        <% } %>\
        ')
});




