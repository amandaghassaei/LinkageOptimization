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
        if (val == "hillClimbing" || val == "ga" || val == "nelderMead"){
            globals.appState.set("optimizationStrategy", val);
        } else console.warn("unknown optimization strategy " + val);
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
        <input type="radio" name="optimizationStrategies" <% if (optimizationStrategy == "hillClimbing"){ %> checked <% } %>value="hillClimbing" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Hill-Climbing (Gradient) <a class="helpModal" data-type="hillClimbing" href="#">( ? )</a>\
        </label>\
        <label class="radio">\
        <input type="radio" name="optimizationStrategies" <% if (optimizationStrategy == "ga"){ %>checked <% } %>value="ga" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Genetic Algorithm  <a class="helpModal" data-type="ga" href="#">( ? )</a>\
        </label>\
        <label class="radio disabled">\
        <input type="radio" name="optimizationStrategies" <% if (optimizationStrategy == "nelderMead"){ %>checked <% } %>value="nelderMead" data-toggle="radio" disabled class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Nelder–Mead  <a class="helpModal" data-type="nelderMead" href="#">( ? )</a>\
        </label>\
        <label class="radio disabled">\
        <input type="radio" name="optimizationStrategies" <% if (optimizationStrategy == "nelderMead"){ %>checked <% } %>value="nelderMead" data-toggle="radio" disabled class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Nelder–Mead (with inertia)\
        </label>\
        <label class="radio disabled">\
        <input type="radio" name="optimizationStrategies" <% if (optimizationStrategy == "nelderMead"){ %>checked <% } %>value="nelderMead" data-toggle="radio" disabled class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Conjugate Gradient  <a class="helpModal" data-type="conjugateGrad" href="#">( ? )</a>\
        </label>\
        <br/>\
        <% if (optimizationStrategy == "ga"){ %>\
        Population Size: &nbsp;&nbsp;<input data-type="populationSize" value="<%= populationSize %>" placeholder="Size" class="form-control numberInput" type="text"> <a class="helpModal" data-type="populationSize" href="#">( ? )</a><br/>\
        <% } %>\
        <label class="checkbox" for="flipVertical">\
        <input type="checkbox" <% if (flipVertical){ %>checked="checked" <% } %> value="" id="flipVertical" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Flip Vertically</label>\
        <label class="checkbox" for="flipHorizontal">\
        <input type="checkbox" <% if (flipHorizontal){ %>checked="checked" <% } %> value="" id="flipHorizontal" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Flip Horizontally</label><br/>\
        <a href="#" id="clearAll" class="btn pull-left btn-halfWidth btn-lg btn-default">Clear All</a>\
        <a href="#" id="reset" class=" btn pull-right btn-halfWidth btn-lg btn-default">Reset</a><br/><br/>\
        <a href="#" class="importJSON btn pull-left btn-halfWidth btn-lg btn-default">Re-Init from Linkage...</a>\
        <a href="#" id="resetFromMostFit" class="btn pull-right btn-halfWidth btn-lg btn-default">Re-Init from Most Fit</a><br/><br/>\
        <a href="#" id="stepNextGen" class="btn-success btn btn-block btn-lg btn-default">Step to Next Generation</a><br/>\
        ')

});