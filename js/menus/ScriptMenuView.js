/**
 * Created by fab on 3/22/15.
 */


ScriptMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #runScript":                                      "_runScript"
    },

    initialize: function(){

        _.bindAll(this, "render");

        //bind events
        this.listenTo(globals.appState, "change", this.render);

    },

    _runScript: function(e){
        e.preventDefault();

    },

    render: function(){
        if (this.model.get("currentTab") != "script") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(_.extend(this.model.toJSON())));
    },

    template: _.template('\
            <a href="#" id="runScript" class=" btn btn-block btn-lg btn-default">Run Script</a><br/>\
        ')

});