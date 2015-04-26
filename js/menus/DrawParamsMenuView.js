/**
 * Created by aghassaei on 1/26/15.
 */

DrawParamsMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "change input:checkbox":                                    "_toggleCheckbox",
        "click #pauseAnimation":                                    "_pauseAnimation",
        "click #startAnimation":                                    "_startAnimation",
        "slide #phase":                                             "_changePhaseSlider"
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

    _toggleCheckbox: function(e){
        this.model.set($(e.target).attr('id'), $(e.target).is(':checked'));
    },

    _pauseAnimation: function(e){
        e.preventDefault();
        globals.appState.set("isAnimating", false);
    },

    _startAnimation: function(e){
        e.preventDefault();
        globals.appState.set("isAnimating", true);
    },

    _changePhaseSlider: function(e){
        var val = $(e.target)[0].value;
        if (val == "") return;
        if (val == globals.appState.get("phase")) return;
        globals.appState.set("phase", val, {silent:true});
        globals.appState.changePhase(val);
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "drawParams") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(this.model.toJSON()));

         $('#phase').slider({
            formatter: function(value) {
                return (Math.PI*2*value/globals.appState.get("numPositionSteps").toString()).toFixed(2);
            }
        });
    },

    template: _.template('\
        <% if (isAnimating) { %>\
        <a href="#" id="pauseAnimation" class="btn-warning btn btn-block btn-lg btn-default">Pause Animation</a>\
        <% } else  { %>\
        <a href="#" id="startAnimation" class="btn-success btn btn-block btn-lg btn-default">Animate</a>\
        <% } %>\
        <% if(fitnessBasedOnTargetPath){ %><input id="phase" data-slider-id="phaseSlider" type="text" data-slider-min="0" data-slider-max="<%= numPositionSteps -1 %>" data-slider-step="1" data-slider-value="<%= phase %>"/><% } %><br/>\
        <!--Num Samples per Cycle: &nbsp;&nbsp;<input data-type="numPositionSteps" value="<%= numPositionSteps %>" placeholder="Num Samples" class="form-control numberInput" type="text"><br/><br/>-->\
        Link Width: &nbsp;&nbsp;<input data-type="linkWidth" value="<%= linkWidth %>" placeholder="Width" class="form-control numberInput" type="text"><br/><br/>\
        <% if (is3D){ %>Depth: &nbsp;&nbsp;<input data-type="zDepth" value="<%= zDepth %>" placeholder="Depth" class="form-control numberInput" type="text"><br/><br/><% } %>\
        <% if(fitnessBasedOnTargetPath){ %>\
        <label class="checkbox" for="showTargetPath">\
        <input type="checkbox" <% if (showTargetPath){ %>checked="checked" <% } %> value="" id="showTargetPath" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Show target path</label>\
        <label class="checkbox" for="showOutputPath">\
        <input type="checkbox" <% if (showOutputPath){ %>checked="checked" <% } %> value="" id="showOutputPath" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Show output hinge trajectory</label>\
        <label class="checkbox" for="showHingePaths">\
        <input type="checkbox" <% if (showHingePaths){ %>checked="checked" <% } %> value="" id="showHingePaths" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Show all hinge trajectories</label><br/>\
        <% } %>\
        ')

});