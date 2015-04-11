/**
 * Created by fab on 3/21/15.
 */


function Linkage(hinges, links, driveCrank){//init a linkage with optional hinges, links, and driveCrank

    if (hinges === undefined) hinges = [];
    if (links === undefined) links = [];
    if (driveCrank == undefined) driveCrank = null;
    this._hinges = hinges;
    this._links = links;
    this._driveCrank = driveCrank;
    this._fitness = null;
}



//Construct

Linkage.prototype.addHingeAtPosition = function(position){
    var hinge = new Hinge(position);
    this._hinges.push(hinge);
    return hinge;
};

Linkage.prototype.addDriveCrank = function(centerHinge, outsideHinge, link){
    if (!centerHinge || !outsideHinge || !link) return console.warn("drive crank parameter is missing");
    var driveCrank = new DriveCrank(centerHinge, outsideHinge, link);
    this._driveCrank = driveCrank;
    return driveCrank;
};

Linkage.prototype.link = function(hingeA, hingeB, distance){
    var link = new Link(hingeA, hingeB, distance);
    this._links.push(link);
    return link;
};



//Mating

Linkage.prototype.mate = function(mate){

};



//Fitness

Linkage.prototype.getFitness = function(){
    if (!this._fitness) this._fitness = this._calcFitness();
    return this._fitness;
};

Linkage.prototype._calcFitness = function(){
    return 4;//todo actually calc fitness here
};



//Draw

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

Linkage.prototype.render = function(){//called from render loop in threeView

    //rotate crank
    if (globals.appState.get("isAnimating") && this._driveCrank){
        this._driveCrank.rotate(globals.appState.get("thetaStep"));
        globals.physics.update();

        this._iterateAllHingesAndLinks(function(object){
            object.render();
        });
    }
};



//Deallocate

Linkage.prototype.destroy = function(){
    this._iterateAllHingesAndLinks(function(object){
        object.destroy();
    });
    this._hinges = [];
    this._links = [];
    if (this._driveCrank) this._driveCrank.destroy();
    this._driveCrank = null;
    this._fitness = null;
    globals.appState.set("isAnimating", false);//todo move this
};


//Utilities

Linkage.prototype._iterateAllHingesAndLinks = function(callback){
    _.each(this._hinges, function (hinge) {
        callback(hinge);
    });
    _.each(this._links, function (link) {
        callback(link);
    });
};

Linkage.prototype._clone = function(){
    var clone = new Linkage();
};
