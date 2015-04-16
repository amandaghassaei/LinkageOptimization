/**
 * Created by aghassaei on 1/26/15.
 */

DrawParamsMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
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
        if (this.model.get("currentTab") != "drawParams") return;

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

    _clearAll: function(e){
        e.preventDefault();
        globals.population.clearAll();
    },

    _reset: function(e){
        e.preventDefault();
        globals.population.reset();
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "drawParams") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        Link Width: &nbsp;&nbsp;<input data-type="linkWidth" value="<%= linkWidth %>" placeholder="Width" class="form-control numberInput" type="text"><br/><br/>\
        Min Link Length: &nbsp;&nbsp;<input data-type="minLinkLength" value="<%= minLinkLength %>" placeholder="Length" class="form-control numberInput" type="text"><br/><br/>\
        <% if (is3D){ %>Depth: &nbsp;&nbsp;<input data-type="zDepth" value="<%= zDepth %>" placeholder="Depth" class="form-control numberInput" type="text"><br/><br/><% } %>\
        <a href="#" id="clearAll" class=" btn btn-block btn-lg btn-default">Clear All</a><br/>\
        <a href="#" id="reset" class=" btn btn-block btn-lg btn-default">Reset</a><br/>\
        ')

});