/**
 * Created by fab on 3/21/15.
 */


Linkage = Backbone.Model.extend({

    defaults: {

        hinges: [],
        links: [],

        linkWidth: 1,
        zDepth: 1

    },

    initialize: function () {

    },

    addHingeAtPosition: function(position){
        var hinge = new Hinge(position, this.get("linkWidth")/2, this.get("zDepth"));
        this.get("hinges").push(hinge);
        return hinge;
    },

    link: function(hingeA, hingeB, distance){
        this.get("links").push(new Link(hingeA, hingeB, this.get("linkWidth"), this.get("zDepth"), distance));
    },

    render: function(){//called from render loop in threeView
        _.each(this.get("hinges"), function(hinge){
            hinge.render();
        });
        _.each(this.get("links"), function(link){
            link.render();
        });
    }
});