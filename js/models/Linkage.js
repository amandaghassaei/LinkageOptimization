/**
 * Created by fab on 3/21/15.
 */


Linkage = Backbone.Model.extend({

    defaults: {

        hinges: [],
        links: [],
        driveCrank: null,

        linkWidth: 3,
        zDepth: 3
    },

    initialize: function () {

        //bind events
        this.listenTo(this, "change:linkWidth", this._setWidth);
        this.listenTo(this, "change:zDepth", this._setDepth);

    },

    _setWidth: function(){
        var width = this.get("linkWidth");
        _.each(this.get("hinges"), function(hinge){
            hinge.setWidth(width);
        });
        _.each(this.get("links"), function(link){
            link.setWidth(width);
        });
    },

    _setDepth: function(){
        var depth = this.get("zDepth");
        _.each(this.get("hinges"), function(hinge){
            hinge.setDepth(depth);
        });
        _.each(this.get("links"), function(link){
            link.setDepth(depth);
        });
    },

    addHingeAtPosition: function(position){
        var hinge = new Hinge(position, this.get("linkWidth"), this.get("zDepth"));
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

        //rotate crank
        if (globals.appState.get("isAnimating") && this.get("driveCrank")){
            this.get("driveCrank").rotate(globals.appState.get("thetaStep"));
            globals.physics.update();
        }

        //if (globals.appState.get("isAnimating")){
            _.each(this.get("hinges"), function (hinge) {
                hinge.render();
            });
            _.each(this.get("links"), function (link) {
                link.render();
            });
        //}
    }
});