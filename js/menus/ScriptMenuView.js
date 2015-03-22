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
        this.listenTo(globals.appState, "change:currentTab", this.render);

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

    _runScript: function(e){
        e.preventDefault();
        globals.linkage.clearAll();
        eval("globals.script =" + this.codeMirror.getValue());
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

    _setEditorHeight: function(){
        var $editor = $('.CodeMirror');
        var height = this.$el.height()-$editor.position().top;
        height = Math.max(height, 250);
        $editor.css({height:height +"px"});
    },

    render: function(){
        if (this.model.get("currentTab") != "script") return;
        //todo check for codemirror focus

        this.$el.html(this.template({script:globals.script}));

        this.codeMirror = CodeMirror.fromTextArea(document.getElementById("scriptEditor"), {
            lineNumbers: true,
            mode: "javascript"
        });
        this._setEditorHeight();
    },

    template: _.template('\
            <div class="col-sm-4"><a href="#" id="loadScript" class=" btn btn-lg btn-block btn-default">Load Script</a></div>\
            <div class="col-sm-4"><a href="#" id="runScript" class=" btn btn-lg btn-block btn-default">Run Script</a></div>\
            <div class="col-sm-4"><a href="#" id="saveScript" class=" btn btn-lg btn-block btn-default">Save Script</a></div><br/><br/>\
            <textarea id="scriptEditor"><%= script %></textarea><br/>\
        ')

});