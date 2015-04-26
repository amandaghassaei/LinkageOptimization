/**
 * Created by aghassaei on 4/24/15.
 */

//todo hinge relaxation

function Walker(json){//Linkage subclass
    Linkage.call(this);//init empty linkage
    this._walkerBodyConstraints = [];
    this._json = JSON.parse(JSON.stringify(json));
    this._isFinished = false;

    var hinges = json.hinges;

    this._verticalOffset = hinges[0].position.y;
    var self = this;
    _.each(hinges, function(hinge){
        if (hinge.position.y < self._verticalOffset) self._verticalOffset = hinge.position.y;
    });
    this._verticalOffset *= 1.15;
    //make crank center hinge #0
    var centerHingeIndex = json.driveCrank.centerHinge;
    var centerHinge = this.addHingeAtPosition(hinges[centerHingeIndex].position);
    hinges[centerHingeIndex].updatedPosition = 0;

    //add cranks (shared between leg pair)
    var numLegs = globals.appState.get("numLegPairs");
    var cranks = [];
    for (var i=0;i<numLegs;i++){
        var outsideHingeIndex = json.driveCrank.outsideHinge;
        cranks.push(this.addHingeAtPosition(this._crankPositionForAngle(Math.PI*2/numLegs*i,
            hinges[outsideHingeIndex].position, hinges[centerHingeIndex].position)));
    }
    hinges[outsideHingeIndex].updatedPosition = 1;

    //then add fixedHinges
    var fixedHinges = [centerHinge];
    var mirrorOffset = 2*centerHinge.getPosition().x;
    _.each(hinges, function(hinge){
        if (hinge.static && hinge.updatedPosition === undefined) {
            hinge.updatedPosition = self._hinges.length;
            var newHinge = self.addHingeAtPosition(hinge.position);
            fixedHinges.push(newHinge);
            //also add mirror
            var newHingeMirror = self.addHingeAtPosition({x:mirrorOffset-hinge.position.x, y:hinge.position.y});
            fixedHinges.push(newHingeMirror);
        }
    });

    //then add legs
    for (var i=0;i<numLegs;i++){
        this.initLeg(hinges, json.links, numLegs, i);
        this.initLeg(hinges, json.links, numLegs, i, mirrorOffset);//mirror leg
    }

    this.addDriveCrank(centerHinge, cranks, json.driveCrank.length);

    this._makeWalkerBody(fixedHinges);
}
Walker.prototype = Object.create(Linkage.prototype);

Walker.prototype._crankPositionForAngle = function(angle, position, centerPosition){
    angle +=  Math.atan2(position.y-centerPosition.y, position.x-centerPosition.x);
    var radius = Math.sqrt(Math.pow(position.x-centerPosition.x, 2) + Math.pow(position.y + centerPosition.y, 2));
    var x = centerPosition.x+Math.cos(angle)*radius;
    var y = centerPosition.y+Math.sin(angle)*radius;
    return {x:x, y:y};
};


Walker.prototype.initLeg = function(hinges, links, numLegs, num, mirrorOffset){
    var self = this;
    var lookupTable = {};
    _.each(hinges, function(hinge, index){//{position:this._position, static:this._static}
        lookupTable[index] = self._hinges.length;
        if (hinge.static || hinge.updatedPosition !== undefined){
            if (mirrorOffset && hinge.updatedPosition > 1){
                lookupTable[index] = hinge.updatedPosition + 1;
                return;
            } else if (hinge.updatedPosition == 1){
                lookupTable[index] = hinge.updatedPosition + num;
                return;
            }
            lookupTable[index] = hinge.updatedPosition;
            return;
        }
        if (mirrorOffset) self.addHingeAtPosition({x:mirrorOffset-hinge.position.x, y:hinge.position.y});
        else self.addHingeAtPosition(hinge.position);
    });
    _.each(links, function(link){//{hinges: [this.getHingeAId(), this.getHingeBId()], length: this._length}
        self.link(self._hinges[lookupTable[link.hinges[0]]], self._hinges[lookupTable[link.hinges[1]]], link.length);
    });

};




//Construct

Walker.prototype.addHingeAtPosition = function(position){
    var hinge = new Hinge({x:position.x, y:position.y-this._verticalOffset}, this, this._material);
    this._hinges.push(hinge);
    return hinge;
};

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

Walker.prototype.addDriveCrank = function(centerHinge, outsideHinges, length){
    if (!centerHinge || !outsideHinges || !length || outsideHinges.length == 0) return console.warn("drive crank parameter is missing");
    var driveCrank = new DriveCrank(centerHinge, outsideHinges, length);
    this._driveCrank = driveCrank;
    return driveCrank;
};




//Fitness

Walker.prototype.getFitness = function(){
    // return 4;
    return this._fitness;
};

Walker.prototype.setFitness = function(fitness){
    this._isFinished = true;
    this._walkerBodyConstraints = null;
    _.each(this._hinges, function(hinge){
        hinge.setStatic(true);
    });
    this.hide();
    this._fitness = fitness;
};

Walker.prototype._finished = function(distance){
    this.setFitness(Math.abs(distance)/10.0);
};






//Trajectories

Walker.prototype.drawTargetPath = function(){
};

Walker.prototype._removeTargetPath = function(){
};

Walker.prototype.setTargetPathVisibility = function(){
};

Walker.prototype.checkContinuity = function(){
};

Walker.prototype.getTrajectory = function(){
    return [];
};

Walker.prototype.drawTrajectories = function(){
};

Walker.prototype.getTranslationScaleRotation = function() {
    //todo get rid of this
    return {translation:{x:0,y:0}};
};




//Draw

Walker.prototype.render = function(angle, tickNum){
    if (!this._isFinished){
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
        if (tickNum == 500) this._finished(this._hinges[0].getCurrentPosition().x);
    }
};

Walker.prototype.setHingePathVisibility = function(){
};

Walker.prototype.hide = function(){
    this._material.opacity = 0.0;
    this._material.transparent = true;
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
    return JSON.parse(JSON.stringify(this._json));//deep copy of json
};

Walker.prototype.clone = function(json){
    if (json === undefined) json = this.toJSON();
    return new Walker(json);
};
