/**
 * Created by aghassaei on 1/26/15.
 */

DrawParamsMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "change #showHingePaths":                                    "_toggleShowHingePaths"
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

    _toggleShowHingePaths: function(e){
        this.model.set('showHingePaths', $(e.target).is(':checked'));
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
        <% if (is3D){ %>Depth: &nbsp;&nbsp;<input data-type="zDepth" value="<%= zDepth %>" placeholder="Depth" class="form-control numberInput" type="text"><br/><br/><% } %>\
        <label class="checkbox" for="showHingePaths">\
        <input type="checkbox" <% if (showHingePaths){ %>checked="checked" <% } %> value="" id="showHingePaths" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Show all hinge trajectories</label>\
        ')

});