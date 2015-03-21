/**
 * Created by aghassaei on 1/26/15.
 */

DrawParamsMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(){

        _.bindAll(this, "render", "_onKeyup");

        $(document).bind('keyup', {}, this._onKeyup);

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
        globals.linkage.set(property, newVal);
    },

    render: function(){
        if (this.model.get("currentTab") != "drawParams") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(_.extend(this.model.toJSON(), globals.linkage.toJSON())));
    },

    template: _.template('\
        Link Width: &nbsp;&nbsp;<input data-type="linkWidth" value="<%= linkWidth %>" placeholder="Width" class="form-control numberInput" type="text"><br/><br/>\
        Depth: &nbsp;&nbsp;<input data-type="zDepth" value="<%= zDepth %>" placeholder="Depth" class="form-control numberInput" type="text">\
        ')

});