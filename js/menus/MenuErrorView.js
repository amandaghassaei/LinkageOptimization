/**
 * Created by aghassaei on 4/16/15.
 */


MenuErrorView = Backbone.View.extend({

    el: "#menuError",

    events: {
    },

    initialize: function(){

    },

    throwError: function(message){
//        console.log(message);
        this.$el.html(this.template({message:message}));
    },

    template: _.template('\
        <%= message %>\
        ')
});




