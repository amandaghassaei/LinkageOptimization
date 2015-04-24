/**
 * Created by aghassaei on 4/15/15.
 */


PopulationMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #stepNextGen":                                   "_stepNextGeneration",
        "click #clearAll":                                      "_clearAll",
        "click #reset":                                         "_reset",
        "change input:checkbox":                                "_toggleCheckbox",
        "change input[name=optimizationStrategies]":            "_changeOptimizationStrategies",
        "click #resetFromMostFit":                              "_resetFromMostFit"
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
        newVal = parseInt(newVal);
        var property = $(e.target).data("type");
        globals.appState.set(property, newVal);
    },

    _toggleCheckbox: function(e){
        this.model.set($(e.target).attr('id'), $(e.target).is(':checked'));
    },

    _changeOptimizationStrategies: function(e){
        var val = $(e.target).val();
        if (val == "hillClimbing"){
            globals.appState.set("isNelderMead", false);
            globals.appState.set("isHillClimbing", true);
        } else if (val == "ga"){
            globals.appState.set("isNelderMead", false);
            globals.appState.set("isHillClimbing", false);
        } else if (val == "nelderMead"){
            globals.appState.set("isHillClimbing", false);
            globals.appState.set("isNelderMead", true);
        }
    },

    _stepNextGeneration: function(e){
        e.preventDefault();
        globals.population.step();
    },

    _reset: function(e){
        e.preventDefault();
        globals.population.reset();
    },

    _resetFromMostFit: function(e){
        e.preventDefault();
        globals.population.reset(globals.population.getBestLinkage());
    },

    _clearAll: function(e){
        e.preventDefault();
        globals.population.clearAll();
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "population") return;
        if ($(".numberInput").is(":focus")) return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        Optimization Strategy:\
        <label class="radio">\
        <input type="radio" name="optimizationStrategies" <% if (isHillClimbing && !isNelderMead){ %> checked <% } %>value="hillClimbing" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Hill-Climbing (Gradient)\
        </label>\
        <label class="radio">\
        <input type="radio" name="optimizationStrategies" <% if (!isHillClimbing && !isNelderMead){ %>checked <% } %>value="ga" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Genetic Algorithm\
        </label>\
        <!--<label class="radio">\
        <input type="radio" name="optimizationStrategies" <% if (!isHillClimbing && isNelderMead){ %>checked <% } %>value="nelderMead" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Nelder–Mead\
        </label>-->\
        <br/>\
        <% if (!isHillClimbing){ %>\
        Population Size: &nbsp;&nbsp;<input data-type="populationSize" value="<%= populationSize %>" placeholder="Size" class="form-control numberInput" type="text"><br/><br/>\
        <% } %>\
        <a href="#" id="clearAll" class="btn pull-left btn-halfWidth btn-lg btn-default">Clear All</a>\
        <a href="#" id="reset" class=" btn pull-right btn-halfWidth btn-lg btn-default">Reset</a><br/><br/>\
        <a href="#" class="importJSON btn pull-left btn-halfWidth btn-lg btn-default">Re-Init from Linkage...</a>\
        <a href="#" id="resetFromMostFit" class="btn pull-right btn-halfWidth btn-lg btn-default">Re-Init from Most Fit</a><br/><br/>\
        <a href="#" id="stepNextGen" class="btn-success btn btn-block btn-lg btn-default">Step to Next Generation</a><br/>\
        ')

});