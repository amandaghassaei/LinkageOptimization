/**
 * Created by fab on 3/22/15.
 */


ScriptMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #runScript":                                       "_runScript",
        "click #saveScript":                                      "_saveScript",
        "click #loadScript":                                      "_loadScript"
    },

    initialize: function(){

        _.bindAll(this, "render");

        //bind events
        this.listenTo(globals.appState, "change", this.render);
        $(document).bind('keyup', {}, this._scriptEdit);

        globals.script = function(){
var hinge1 = globals.linkage.addHingeAtPosition({x:0,y:20});
var hinge2 = globals.linkage.addHingeAtPosition({x:0,y:-20});
var hinge3 = globals.linkage.addHingeAtPosition({x:-10,y:0});
var hinge4 = globals.linkage.addHingeAtPosition({x:14,y:0}).setStatic(true);
var hinge5 = globals.linkage.addHingeAtPosition({x:-20,y:0});

globals.linkage.link(hinge1, hinge3);
globals.linkage.link(hinge3, hinge2);
globals.linkage.link(hinge2, hinge4);
globals.linkage.link(hinge4, hinge1);
var link35 = globals.linkage.link(hinge3, hinge5);
globals.linkage.addDriveCrank(hinge5, hinge3, link35);
};
    },

    _scriptEdit: function(e){
        var $editor = $("#scriptEditor");
        if (!$editor.is(":focus")) return;
        e.preventDefault();
        eval("globals.script =" + $editor.text());
    },

    _runScript: function(e){
        e.preventDefault();
        globals.linkage.clearAll();
        globals.script();
        globals.appState.set("isAnimating", true);
    },

    _saveScript: function(e){
        e.preventDefault();
        globals.appState.saveFile(this.script, "linkageScript", ".js");
    },

    _loadScript: function(e){
        e.preventDefault();
        $("#fileInput").click();
    },

    render: function(){
        if (this.model.get("currentTab") != "script") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(_.extend(this.model.toJSON(), {script:globals.script})));
    },

    template: _.template('\
            <a href="#" id="loadScript" class=" btn btn-block btn-lg btn-default">Load Script</a><br/>\
            <a href="#" id="runScript" class=" btn btn-block btn-lg btn-default">Run Script</a><br/>\
            <div id="scriptEditor" contenteditable><%= script %></div><br/>\
            <a href="#" id="saveScript" class=" btn btn-block btn-lg btn-default">Save Script</a><br/>\
        ')

});