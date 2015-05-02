/**
 * Created by aghassaei on 4/22/15.
 */



MutationMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #stepNextGen":                                   "_stepNextGeneration",
        "change input:checkbox":                                "_toggleCheckbox"
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

    _toggleCheckbox: function(e){
        this.model.set($(e.target).attr('id'), $(e.target).is(':checked'));
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "mutation") return;
        if ($(".numberInput").is(":focus")) return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        <label class="checkbox" for="simulatedAnnealing">\
        <input type="checkbox" <% if (simulatedAnnealing){ %>checked="checked" <% } %> value="" id="simulatedAnnealing" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Simulated Annealing <a class="helpModal" data-type="simulatedAnnealing" href="#">( ? )</a></label><br/>\
        <% if (simulatedAnnealing){ %>\
        Mutation Rate (%): &nbsp;&nbsp;<input data-type="saMaxMutationRate" value="<%= saMaxMutationRate %>" placeholder="Mutation Rate" class="form-control numberInput" type="text">&nbsp;&nbsp;to&nbsp;&nbsp;<input data-type="saMinMutationRate" value="<%= saMinMutationRate %>" placeholder="Mutation Rate" class="form-control numberInput" type="text"> <a class="helpModal" data-type="mutationRate" href="#">( ? )</a><br/><br/>\
        Max Length Change (%): &nbsp;&nbsp;<input data-type="saMaxLinkChange" value="<%= saMaxLinkChange %>" placeholder="Max Change" class="form-control numberInput" type="text">&nbsp;&nbsp;to&nbsp;&nbsp;<input data-type="saMinLinkChange" value="<%= saMinLinkChange %>" placeholder="Max Change" class="form-control numberInput" type="text">  <a class="helpModal" data-type="maxLengthChange" href="#">( ? )</a><br/><br/>\
        <% } else { %>\
        Mutation Rate (%): &nbsp;&nbsp;<input data-type="mutationRate" value="<%= mutationRate %>" placeholder="Mutation Rate" class="form-control numberInput" type="text"> <a class="helpModal" data-type="mutationRate" href="#">( ? )</a><br/><br/>\
        Max Length Change (%): &nbsp;&nbsp;<input data-type="maxLinkChange" value="<%= maxLinkChange %>" placeholder="Max Change" class="form-control numberInput" type="text"> <a class="helpModal" data-type="maxLengthChange" href="#">( ? )</a><br/><br/>\
        <% } %>\
        Min Link Length: &nbsp;&nbsp;<input data-type="minLinkLength" value="<%= minLinkLength %>" placeholder="Length" class="form-control numberInput" type="text"> <a class="helpModal" data-type="minLinkLength" href="#">( ? )</a><br/><br/>\
        <label class="checkbox disabled" for="mutateTopology">\
        <input disabled type="checkbox" <% if (mutateTopology){ %>checked="checked" <% } %> value="" id="mutateTopology" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Mutate Topology <a class="helpModal" data-type="mutateTopology" href="#">( ? )</a></label><br/>\
        <% if (mutateTopology){ %>\
            Mutation Options\
        <% } %>\
        ')
});

