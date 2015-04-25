/**
 * Created by aghassaei on 4/24/15.
 */


function Walker(json){//Linkage subclass
    Linkage.call(this);//init empty linkage
    this._walkerBodyConstraints = [];

    this.initLeg(json);//todo call multiple times

    //{centerHinge: this.getCenterHingeId(), outsideHinge: this.getOutsideHingeId(), length: this._length}
    this.addDriveCrank(this._hinges[json.driveCrank.centerHinge], this._hinges[json.driveCrank.outsideHinge], json.driveCrank.length);

//    if (isWalker){
//
//        _.each(this._hinges, function(hinge, index){
//            if (!hinge.static) return;
//            if (self._hinges.length <= index+1) return;
//            for (var i=index+1;i<self._hinges.length;i++){//link to all other static hinges
//                if (self._hinges[i].static) self._makeWalkerBody(hinge, self._hinges[i]);
//            }
//            hinge.setStatic(false);
//        });
//    }
}
Walker.prototype = Object.create(Linkage.prototype);


Walker.prototype.initLeg = function(json){
    var self = this;
    _.each(json.hinges, function(hinge){//{position:this._position, static:this._static}
        var newHinge = self.addHingeAtPosition(hinge.position);
        if (hinge.static) newHinge.setStatic(true);
    });
    _.each(json.links, function(link){//{hinges: [this.getHingeAId(), this.getHingeBId()], length: this._length}
        self.link(self._hinges[link.hinges[0]], self._hinges[link.hinges[1]], link.length);
    });

};




//Construct

Walker.prototype._makeWalkerBody = function(hingeA, hingeB){
    var link = new Link(hingeA, hingeB, this._material);
    this._walkerBodyConstraints.push(link);
    return link;
};




//Fitness

Walker.prototype.getFitness = function(){
    // return 4;
    if (!this._fitness) this._fitness = this._calcFitness();
    return this._fitness;
};

Walker.prototype._calcFitness = function(target, test){
    return 3;
};





//Trajectories

Walker.prototype.drawTargetPath = function(){
};

Walker.prototype._removeTargetPath = function(){
};

Walker.prototype.setTargetPathVisibility = function(visibility){
};

Walker.prototype.checkContinuity = function(){
};

Walker.prototype.getTrajectory = function(){
    return [];
};

Walker.prototype.drawTrajectories = function(visibility){
};

Walker.prototype.getTranslationScaleRotation = function() {
    //todo get rid of this
    return {translation:{x:0,y:0}};
};




//Draw

Walker.prototype.render = function(angle){
    var self = this;
    if (angle == 0) console.log(angle);
    this.drive(angle);
    _.each(this._hinges, function(hinge){
        hinge.physicsRender(self._drawOffset);
    });
    _.each( this._links, function(link){
        link.render(self._drawOffset);
    });
};

Walker.prototype.setHingePathVisibility = function(){
};



//Deallocate

Walker.prototype.destroy = function(){
    _.each(this._walkerBodyConstraints, function(constraint){
        constraint.destroy();
    });
    this._walkerBodyConstraints = null;
    Linkage.prototype.destroy.call(this);
};




//Utilities

Walker.prototype.toJSON = function(){
    var hingesJSON = [];
    _.each(this._hinges, function(hinge){
        hingesJSON.push(hinge.toJSON());
    });
    var linksJSON = [];
    _.each(this._links, function(link){
        linksJSON.push(link.toJSON());
    });
    return {
        hinges: hingesJSON,
        links: linksJSON,
        driveCrank: this._driveCrank.toJSON()
    }
};

Walker.prototype.clone = function(json){
    if (json === undefined) json = this.toJSON();
    return new Linkage(json);
};
