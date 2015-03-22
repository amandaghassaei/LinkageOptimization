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

        _.bindAll(this, "render", "_handleKeyStroke");

        //bind events
        this.listenTo(globals.appState, "change:currentTab", this.render);
        $(document).bind('keydown', {}, this._handleKeyStroke);
    },

    _handleKeyStroke: function(e){
        if (e.keyCode == 82 && this.model.get("currentTab") == "script"){
            if (e.shiftKey || !e.metaKey) return;
            e.stopPropagation();
            this._runScript(e);
        }
    },

    _syncScript: function(){
        eval("globals.script =" + this.codeMirror.getValue());
    },

    _runScript: function(e){
        e.preventDefault();
        globals.linkage.clearAll();
        this._syncScript();
        globals.script();
        globals.appState.set("isAnimating", true);
    },

    _saveScript: function(e){
        e.preventDefault();
        this._syncScript();
        globals.appState.saveFile(globals.script, "linkageScript", ".js");
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
            <div class="col-sm-4"><a href="#" id="runScript" class=" btn btn-lg btn-block btn-default">Run Script&nbsp&nbsp&nbsp(CTRL/&#8984; + R)</a></div>\
            <div class="col-sm-4"><a href="#" id="saveScript" class=" btn btn-lg btn-block btn-default">Save Script</a></div><br/><br/>\
            <textarea id="scriptEditor"><%= script %></textarea><br/>\
        ')

});