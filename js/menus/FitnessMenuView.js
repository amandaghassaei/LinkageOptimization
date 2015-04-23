/**
 * Created by aghassaei on 4/16/15.
 */


FitnessMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #stepNextGen":                                       "_stepNextGeneration",
        "change input:checkbox":                                    "_toggleCheckbox",
        "click #savePath":                                          "_saveTargetPath",
        "click #loadPath":                                          "_loadTargetPath",
        "click #saveOutputPath":                                    "_saveOutputPath"
    },

    initialize: function(){

        _.bindAll(this, "render", "_onKeyup");

        //bind events
        $(document).bind('keyup', {}, this._onKeyup);
        this.listenTo(globals.appState, "change", this.render);

    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "fitness") return;

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

    _saveTargetPath: function(e){
        e.preventDefault();
        globals.saveFile(JSON.stringify({
            path: globals.targetCurve
        }), "targetPath", ".json");
    },

    _saveOutputPath: function(e){
        e.preventDefault();
        globals.population.saveBestOutputPath();
    },

    _loadTargetPath: function(e){
        e.preventDefault();
        $("#fileInput").click();
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "fitness") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        Output Hinge Index: &nbsp;&nbsp;<input data-type="outputHingeIndex" value="<%= outputHingeIndex %>" placeholder="Hinge" class="form-control numberInput" type="text"><br/><br/>\
        <a href="#" id="loadPath" class="btn btn-block btn-lg btn-default">Load Target Path</a><br/>\
        <a href="#" id="savePath" class=" btn pull-left btn-halfWidth btn-lg btn-default">Save Target Path</a>\
        <a href="#" id="saveOutputPath" class="btn pull-right btn-halfWidth btn-lg btn-default">Save Best Output Path</a><br/><br/>\
        <label class="checkbox" for="showTargetPath">\
        <input type="checkbox" <% if (showTargetPath){ %>checked="checked" <% } %> value="" id="showTargetPath" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Show target path</label>\
        <label class="checkbox" for="showOutputPath">\
        <input type="checkbox" <% if (showOutputPath){ %>checked="checked" <% } %> value="" id="showOutputPath" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
        Show output hinge trajectory</label>\
        ')
});




