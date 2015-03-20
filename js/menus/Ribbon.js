/**
 * Created by fab on 3/18/15.
 */


Ribbon = Backbone.View.extend({

    el: "#navRibbon",

    events: {
        "click #cellModeToggle":                                    "_toggleCellMode"
    },

    initialize: function(){

        _.bindAll(this, "render");

        //bind events
        this.listenTo(this.model, "change", this.render);

        this.render();
    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
//        if ()
    },

    template: _.template('\
        <div class="btn-toolbar">\
            <div class="btn-group">\
              <a id="twoDView" class="btn btn-primary btn-ribbon" href="#">2D</a>\
              <a id="threeDView" class="btn btn-primary btn-ribbon" href="#">3D</a>\
              <a id="threeDView" class="btn btn-primary btn-ribbon" href="#">another button</a>\
            </div>\
        </div>\
        ')

});