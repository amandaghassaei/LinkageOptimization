/**
 * Created by aghassaei on 4/15/15.
 */


PopulationMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #stepNextGen":                                   "_stepNextGeneration",
        "click #clearAll":                                      "_clearAll",
        "click #reset":                                         "_reset"
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

    _stepNextGeneration: function(e){
        e.preventDefault();
        globals.population.step();
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "population") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        Population Size: &nbsp;&nbsp;<input data-type="populationSize" value="<%= populationSize %>" placeholder="Size" class="form-control numberInput" type="text"><br/><br/>\
        <a href="#" id="clearAll" class="btn pull-left btn-halfWidth btn-lg btn-default">Clear All</a>\
        <a href="#" id="reset" class=" btn pull-right btn-halfWidth btn-lg btn-default">Re-Init Population</a><br/><br/>\
        <a href="#" id="stepNextGen" class="btn-success btn btn-block btn-lg btn-default">Step to Next Generation</a><br/>\
        ')

});