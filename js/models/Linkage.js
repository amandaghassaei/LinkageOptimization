/**
 * Created by fab on 3/21/15.
 */


Linkage = Backbone.Model.extend({

    defaults: {

        hinges: [],
        links: [],
        driveCrank: null,

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

    addDriveCrank: function(centerHinge, outsideHinge, link){
        if (!centerHinge || !outsideHinge || !link) return console.warn("parameter is missing");
        var driveCrank = new DriveCrank(centerHinge, outsideHinge, link);
        this.set("driveCrank", driveCrank);
        return driveCrank;
    },

    link: function(hingeA, hingeB, distance){
        var link = new Link(hingeA, hingeB, this.get("linkWidth"), this.get("zDepth"), distance);
        this.get("links").push(link);
        return link;
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