/**
 * Created by aghassaei on 4/22/15.
 */



MutationMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #stepNextGen":                                   "_stepNextGeneration"
    },

    initialize: function(){

        _.bindAll(this, "render", "_onKeyup");

        //bind events
        $(document).bind('keyup', {}, this._onKeyup);
        this.listenTo(globals.appState, "change", this.render);

    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "mutation") return;

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

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "mutation") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        Mutation Rate (%): &nbsp;&nbsp;<input data-type="mutationRate" value="<%= mutationRate %>" placeholder="Mutation Rate" class="form-control numberInput" type="text"><br/><br/>\
        Max Link Length Change (%): &nbsp;&nbsp;<input data-type="maxLinkChange" value="<%= maxLinkChange %>" placeholder="Max Change" class="form-control numberInput" type="text"><br/><br/>\
        Min Link Length: &nbsp;&nbsp;<input data-type="minLinkLength" value="<%= minLinkLength %>" placeholder="Length" class="form-control numberInput" type="text"><br/><br/>\
        ')
});

