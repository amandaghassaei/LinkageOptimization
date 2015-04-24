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
        "click #runStepNextGen":                                    "_stepNextGeneration"
    },

    initialize: function(){

        _.bindAll(this, "render", "_onKeyup");

        //bind events
        $(document).bind('keyup', {}, this._onKeyup);
        this.listenTo(globals.appState, "change", this.render);

    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "population") return;

        if ($("input").is(":focus") && e.keyCode == 13) {//enter key
            $(e.target).blur();
            this.render();
            return;
        }

        if ($(".numberInput").is(":focus")) this._updateNumber(e);
    },

    _updateNumber: function(e){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        newVal = parseFloat(newVal.toFixed(4));
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

    _stepNextGeneration: function(e){
        e.preventDefault();
        globals.population.step();
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "run") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        <% if (isRunning) { %>\
        <a href="#" id="pauseGA" class="btn-warning btn btn-block btn-lg btn-default">Pause Run</a><br/>\
        <% } else  { %>\
        <a href="#" id="runGA" class="btn-success btn btn-block btn-lg btn-default">Run</a><br/>\
        <a href="#" id="runStepNextGen" class="btn btn-block btn-lg btn-default">Step to Next Generation</a><br/>\
        <% } %>\
        <label class="checkbox" for="shouldRenderThreeJS">\
        <input type="checkbox" <% if (shouldRenderThreeJS){ %>checked="checked" <% } %> value="" id="shouldRenderThreeJS" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Render linkages during run (less efficient)</label>\
        ')
});




