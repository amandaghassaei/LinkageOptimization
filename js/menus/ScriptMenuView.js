/**
 * Created by fab on 3/22/15.
 */


ScriptMenuView = Backbone.View.extend({

    el: "#scriptView",

    events: {
        "click #runScript":                                       "_runScript",
        "click #saveScript":                                      "_saveScript",
        "click #loadScript":                                      "_loadScript"
    },

    initialize: function(){

        _.bindAll(this, "render", "_handleKeyStroke");

        //bind events
        $(document).bind('keydown', {}, this._handleKeyStroke);
        this.render();

        this.listenTo(this.model, "change:scriptMenuIsVisible", this._setVisibility);
//        if (this.model.get("scriptMenuIsVisible")) this._setVisibility();
    },

    _handleKeyStroke: function(e){
        if (e.keyCode == 82 && this.model.get("currentTab") == "script"){
            if (e.shiftKey || !e.metaKey) return;
            e.preventDefault();
            e.stopPropagation();
            globals.appState.runScript(globals.codeMirror.getValue());
        }
    },

    _runScript: function(e){
        e.preventDefault();
        globals.appState.runScript(globals.codeMirror.getValue());
    },

    _saveScript: function(e){
        e.preventDefault();
        globals.appState.syncScript(globals.codeMirror.getValue());
        globals.saveFile(globals.script, "linkageScript", ".js");
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

    _setVisibility: function(){
        if(this.model.get("scriptMenuIsVisible")) this._show();
        else this._hide();
    },

    _hide: function(){
        var width = this.$el.parent().width();
        this.$el.animate({left: "-" + width + "px"});
    },

    _show: function(){
        this.$el.animate({left: "0"});
    },

    render: function(){
        this.$el.html(this.template({script:globals.script}));
        globals.codeMirror = CodeMirror.fromTextArea(document.getElementById("scriptEditor"), {
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