/**
 * Created by aghassaei on 1/26/15.
 */

ExampleMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(options){

        _.bindAll(this, "render");
    },

    render: function(){
//        if (this.model.get("currentTab") != "script") return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        menu view\
        ')

});