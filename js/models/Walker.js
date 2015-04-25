/**
 * Created by aghassaei on 4/24/15.
 */


function Walker(json){//Linkage subclass
    Linkage.call(this);//init empty linkage
    this._walkerBodyConstraints = [];

    var hinges = json.hinges;

    //make crank center hinge #0
    var centerHingeIndex = json.driveCrank.centerHinge;
    var centerHinge = this.addHingeAtPosition(hinges[centerHingeIndex].position);
    hinges[centerHingeIndex].updatedPosition = 0;

    //then add fixedHinges
    var fixedHinges = [centerHinge];
    var self = this;
    _.each(hinges, function(hinge){
        if (hinge.static && hinge.updatedPosition === undefined) {
            var newHinge = self.addHingeAtPosition(hinge.position);
            hinge.updatedPosition = fixedHinges.length;
            fixedHinges.push(newHinge);
        }
    });

    //then add legs
    this.initLeg(hinges, json.links);//todo call multiple times


    //{centerHinge: this.getCenterHingeId(), outsideHinge: this.getOutsideHingeId(), length: this._length}
    this.addDriveCrank(this._hinges[0], this._hinges[json.driveCrank.outsideHinge+fixedHinges.length], json.driveCrank.length);

    this._makeWalkerBody(fixedHinges);
}
Walker.prototype = Object.create(Linkage.prototype);


Walker.prototype.initLeg = function(hinges, links){
    var self = this;
    var lookupTable = {};
    _.each(hinges, function(hinge, index){//{position:this._position, static:this._static}
        lookupTable[index] = self._hinges.length;
        if (hinge.static || hinge.updatedPosition !== undefined){
            lookupTable[index] = hinge.updatedPosition;
            return;
        }
        self.addHingeAtPosition(hinge.position);
    });
    _.each(links, function(link){//{hinges: [this.getHingeAId(), this.getHingeBId()], length: this._length}
        self.link(self._hinges[lookupTable[link.hinges[0]]], self._hinges[lookupTable[link.hinges[1]]], link.length);
    });

};




//Construct

Walker.prototype._makeWalkerBody = function(hinges){
    var self = this;
    _.each(hinges, function(hinge, index){
        if (hinges.length <= index + 1) return;
        for (var i=index+1;i<hinges.length;i++){
            var link = new Link(hinge, hinges[i], self._material);
            self._walkerBodyConstraints.push(link);
        }
    });
};

Walker.prototype.addDriveCrank = function(centerHinge, outsideHinge, length){
    if (!centerHinge || !outsideHinge || !length) return console.warn("drive crank parameter is missing");
    var driveCrank = new DriveCrank(centerHinge, outsideHinge, length);
    this._driveCrank = driveCrank;
    return driveCrank;
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
    this.drive(angle);
    _.each(this._hinges, function(hinge){
        hinge.physicsRender(self._drawOffset);
    });
    _.each( this._links, function(link){
        link.render(self._drawOffset);
    });
    _.each( this._walkerBodyConstraints, function(link){
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
