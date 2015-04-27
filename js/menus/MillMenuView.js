/**
 * Created by aghassaei on 4/26/15.
 */


MillMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "change input:checkbox":                                    "_toggleCheckbox",
        "change input[name=units]":                                 "_changeUnits"
    },

    initialize: function(){

        _.bindAll(this, "render", "_onKeyup");

        //bind events
        $(document).bind('keyup', {}, this._onKeyup);
        this.listenTo(globals.appState, "change", this.render);

        this._fillThreeBar = true;
        this._units = "inches";

    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "mill") return;

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
        if (property) globals.appState.set(property, newVal);
        else console.log(newVal);
    },

    _toggleCheckbox: function(e){
        this.model.set($(e.target).attr('id'), $(e.target).is(':checked'));
    },

    _changeUnits: function(e){
        var val = $(e.target).val();
        if (val == "inches" || val == "cm"){
            this._units = val;
        } else console.warn("unknown units " + val);
    },

    _changeScaleSlider: function(e){
        var val = $(e.target)[0].value;
        if (val == "") return;
        if (val == globals.appState.get("phase")) return;
        globals.appState.set("phase", val, {silent:true});
        globals.appState.changePhase(val);
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "mill") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(_.extend({fillThreeBar:this._fillThreeBar, units:this._units}, this.model.toJSON())));

//         $('#scale').slider({
//            formatter: function(value) {
//                return (Math.PI*2*value/globals.appState.get("numPositionSteps").toString()).toFixed(2);
//            }
//        });
    },

    template: _.template('\
        Num Leg Pairs: &nbsp;&nbsp;<input id="numLegPairs" data-type="numLegPairs" value="<%= numLegPairs %>" placeholder="Num Pairs" class="form-control numberInput" type="text"><br/><br/>\
        Units:<br/>\
        <label class="radio">\
        <input type="radio" name="units" <% if (units == "inches"){ %> checked <% } %>value="inches" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Inches\
        </label>\
        <label class="radio">\
        <input type="radio"  name="units" <% if (units == "cm"){ %>checked <% } %>value="cm" data-toggle="radio" class="custom-radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        cm\
        </label><br/>\
        Dowel Diameter: &nbsp;&nbsp;<input id="dowelDiameter" value="0.25" placeholder="Diameter" class="form-control numberInput" type="text"><br/><br/>\
        Link Width: &nbsp;&nbsp;<input data-type="linkWidth" value="<%= linkWidth %>" placeholder="Width" class="form-control numberInput" type="text"><br/><br/>\
        Material Thickness: &nbsp;&nbsp;<input data-type="zDepth" value="<%= zDepth %>" placeholder="Depth" class="form-control numberInput" type="text"><br/><br/>\
        <label class="checkbox" for="fillThreeBar">\
        <input type="checkbox" <% if (fillThreeBar){ %>checked="checked" <% } %> value="" id="fillThreeBar" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Output three-bar linkage as solid triangle</label>\
        ')

});