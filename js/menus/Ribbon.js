/**
 * Created by fab on 3/18/15.
 */


Ribbon = Backbone.View.extend({

    el: "#navRibbon",

    events: {
        "click #playPause":                                     "_playPause",
        "click .is3d":                                          "_changeDimension"
    },

    initialize: function(){

        _.bindAll(this, "render");

        //bind events
        this.listenTo(this.model, "change", this.render);

        this.render();
    },

    _playPause: function(e){
        e.preventDefault();
        var state = this.model.get("isAnimating");
        this.model.set("isAnimating", !state);
    },

    _changeDimension: function(e){
        e.preventDefault();
        globals.appState.set("is3D", $(e.target).data("state"));
    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        <div class="btn-toolbar">\
            <div class="btn-group">\
              <a data-state="false" class="btn btn-primary btn-ribbon is3d" href="#">2D</a>\
              <a data-state="true" class="btn btn-primary btn-ribbon is3d" href="#">3D</a>\
              <a id="playPause" class="btn btn-primary btn-ribbon" href="#">play/pause</a>\
            </div>\
        </div>\
        ')

});