/**
 * Created by fab on 3/21/15.
 */


function Linkage(hinges, links, driveCrank){//init a linkage with optional hinges, links, and driveCrank

    if (hinges === undefined) hinges = [];
    if (links === undefined) links = [];
    if (driveCrank == undefined) driveCrank = null;
    this.hinges = hinges;
    this.links = links;
    this.driveCrank = driveCrank;
}

Linkage.prototype.setWidth = function(width){
    this._iterateAllHingesAndLinks(function(object){
        object.setWidth(width);
    });
};

Linkage.prototype.setDepth = function(depth){
    this._iterateAllHingesAndLinks(function(object){
        object.setDepth(depth);
    });
};

Linkage.prototype.addHingeAtPosition = function(position){
    var hinge = new Hinge(position);
    this.hinges.push(hinge);
    return hinge;
};

Linkage.prototype.addDriveCrank = function(centerHinge, outsideHinge, link){
    if (!centerHinge || !outsideHinge || !link) return console.warn("drive crank parameter is missing");
    var driveCrank = new DriveCrank(centerHinge, outsideHinge, link);
    this.driveCrank = driveCrank;
    return driveCrank;
};

Linkage.prototype.link = function(hingeA, hingeB, distance){
    var link = new Link(hingeA, hingeB, distance);
    this.links.push(link);
    return link;
};

Linkage.prototype.destroy = function(){
    this._iterateAllHingesAndLinks(function(object){
        object.destroy();
    });
    this.hinges = [];
    this.links = [];
    if (this.driveCrank) this.driveCrank.destroy();
    this.driveCrank = null;
    globals.appState.set("isAnimating", false);
};

Linkage.prototype._iterateAllHingesAndLinks = function(callback){
    _.each(this.hinges, function (hinge) {
        callback(hinge);
    });
    _.each(this.links, function (link) {
        callback(link);
    });
};

Linkage.prototype.render = function(){//called from render loop in threeView

    //rotate crank
    if (globals.appState.get("isAnimating") && this.driveCrank){
        this.driveCrank.rotate(globals.appState.get("thetaStep"));
        globals.physics.update();

        this._iterateAllHingesAndLinks(function(object){
            object.render();
        });
    }
};
