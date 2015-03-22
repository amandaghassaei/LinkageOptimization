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
        this.listenTo(globals.appState, "change:is3D", this._setDepth);

    },

    _setWidth: function(){
        var width = this.get("linkWidth");
        this._iterateAllHingesAndLinks(function(object){
            object.setWidth(width);
        });
    },

    _setDepth: function(){
        var depth = this._getDepth();
        this._iterateAllHingesAndLinks(function(object){
            object.setDepth(depth);
        });
    },

    _getDepth: function(){
        if (!globals.appState.get("is3D")) return 0.000001;
        return this.get("zDepth");
    },

    addHingeAtPosition: function(position){
        var hinge = new Hinge(position, this.get("linkWidth"), this._getDepth());
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
        var link = new Link(hingeA, hingeB, this.get("linkWidth"), this._getDepth(), distance);
        this.get("links").push(link);
        return link;
    },

    clearAll: function(){
        this._iterateAllHingesAndLinks(function(object){
            object.destroy();
        });
        this.set("hinges", []);
        this.set("links", []);
        if (this.get("driveCrank")) this.get("driveCrank").destroy();
        this.set("driveCrank", null);
        globals.appState.set("isAnimating", false);
    },

    _iterateAllHingesAndLinks: function(callback){
        _.each(this.get("hinges"), function (hinge) {
            callback(hinge);
        });
        _.each(this.get("links"), function (link) {
            callback(link);
        });
    },

    render: function(){//called from render loop in threeView

        //rotate crank
        if (globals.appState.get("isAnimating") && this.get("driveCrank")){
            this.get("driveCrank").rotate(globals.appState.get("thetaStep"));
            globals.physics.update();

            this._iterateAllHingesAndLinks(function(object){
                object.render();
            });
        }
    }
});