/**
 * Created by aghassaei on 4/24/15.
 */

//todo hinge relaxation

function Walker(linkage, numLegs, numStoredPositions){//Linkage subclass
    Linkage.call(this);//init empty linkage

    var json = linkage.toJSON();
    this._walkerBodyConstraints = [];
    this._json = JSON.parse(JSON.stringify(json));//make a deep copy
    this._isFinished = false;

    var hinges = json.hinges;
    var trajectories = linkage.getTrajectories();
    var self = this;

    var centerHingeIndex = json.driveCrank.centerHinge;
    var outsideHingeIndex = json.driveCrank.outsideHinge;
    var numPositions = trajectories[0].length;

    var topPhase = this._getTopPhase(hinges[centerHingeIndex].position, trajectories[outsideHingeIndex]);//get crank phase at 12 o clock position
    var initalPhases = this._getInitialPhases(numLegs, numStoredPositions, topPhase, numPositions);
    var complimentaryPhases = this._getComplimentaryPhases(initalPhases, topPhase, numPositions);
    this._verticalOffset = this._getVerticalOffset(trajectories, initalPhases);//todo

    //make crank center hinge #0

    var centerHinge = this.addHingeAtPosition(hinges[centerHingeIndex].position);
    hinges[centerHingeIndex].updatedPosition = 0;

    //add cranks (shared between leg pair)
    var cranks = [];
    for (var i=0;i<numLegs;i++){
        var outsideHingeIndex = json.driveCrank.outsideHinge;
        cranks.push(this.addHingeAtPosition(trajectories[outsideHingeIndex][initalPhases[i]]));
//        cranks.push(this.addHingeAtPosition(this._crankPositionForAngle(Math.PI*2/numLegs*i,
//            hinges[outsideHingeIndex].position, hinges[centerHingeIndex].position)));
    }
    hinges[outsideHingeIndex].updatedPosition = 1;

    //then add fixedHinges
    var fixedHinges = [centerHinge];
    var mirrorOffset = 2*centerHinge.getPosition().x;
    _.each(hinges, function(hinge){
        if (hinge.static && (typeof hinge.updatedPosition == "undefined")) {
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
        this._initLeg(hinges, trajectories, json.links, initalPhases[i], i);
        this._initLeg(hinges, trajectories, json.links, complimentaryPhases[i], i, mirrorOffset);//mirror leg
    }

    this._addDriveCrank(centerHinge, cranks, json.driveCrank.length);

    this._makeWalkerBody(fixedHinges);

}
Walker.prototype = Object.create(Linkage.prototype);

Walker.prototype._getTopPhase = function(center, trajectory){
    var topPhase = 0;
    _.each(trajectory, function(point, index){
        if (point.y<center.y) return;
        if (Math.abs(center.x-point.x) < Math.abs(center.x-trajectory[topPhase].x)) topPhase = index;
    });
    return topPhase;
};

Walker.prototype._getComplimentaryPhases = function(initalPhases, topPhase, numPositions){
    var compliments = [];
    _.each(initalPhases, function(phase){
        var compliment = 2*topPhase-phase;
        if (compliment < 0) compliment += numPositions;
        if (compliment >= numPositions) compliment -= numPositions;
        compliments.push(compliment);
    });
    return compliments;
};

Walker.prototype._getInitialPhases = function(numLegs, numStoredPositions, topPhase, numPositions){
    var phases = [topPhase];
    for (var i=1;i<numLegs;i++){
        phases.push(Math.round(numStoredPositions*i/numLegs)+topPhase);
        if (phases[i] >= numPositions) phases[i] -= numPositions;
    }
    return phases;
};

Walker.prototype._getVerticalOffset = function(trajectories, phases){
    var offset = trajectories[0][phases[0]].y;
    _.each(phases, function(phase){
        _.each(trajectories, function(trajectory){
            if (trajectory[phase].y < offset) offset = trajectory[phase].y;
        });
    });
    return offset-globals.appState.get("linkWidth")/2.0;
};

Walker.prototype._crankPositionForAngle = function(angle, position, centerPosition){
    angle +=  Math.atan2(position.y-centerPosition.y, position.x-centerPosition.x);
    var radius = Math.sqrt(Math.pow(position.x-centerPosition.x, 2) + Math.pow(position.y + centerPosition.y, 2));
    var x = centerPosition.x+Math.cos(angle)*radius;
    var y = centerPosition.y+Math.sin(angle)*radius;
    return {x:x, y:y};
};


Walker.prototype._initLeg = function(hinges, trajectories, links, phase, num, mirrorOffset){
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
        var position = trajectories[index][phase];
        if (mirrorOffset) self.addHingeAtPosition({x:mirrorOffset-position.x, y:position.y}).setZIndex(0);
        else self.addHingeAtPosition(position).setZIndex(0);
    });
    _.each(links, function(link){//{hinges: [this.getHingeAId(), this.getHingeBId()], length: this._length}
        if (self._hinges.length <= lookupTable[link.hinges[0]] || self._hinges.length <= lookupTable[link.hinges[1]]) return;
        self.link(self._hinges[lookupTable[link.hinges[0]]], self._hinges[lookupTable[link.hinges[1]]], link.length).setZIndex(0);
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
    this._walkerBody = globals.physics.makeWalkerBody(hinges[0].getBody(), hinges[1].getBody(), hinges[2].getBody());
};

Walker.prototype.addDriveCrank = function(){
    console.warn("no add drive crank called externally for Walker class");
};

Walker.prototype._addDriveCrank = function(centerHinge, outsideHinges, length){
    if (!centerHinge || !outsideHinges || !length || outsideHinges.length == 0) return console.warn("drive crank parameter is missing");
    var driveCrank = new DriveCrank(centerHinge, outsideHinges, length);
    this._driveCrank = driveCrank;
    return driveCrank;
};




//Fitness

Walker.prototype.getFitness = function(){
    return this._fitness;
};

Walker.prototype.setFitness = function(fitness){
    this._isFinished = true;
    _.each(this._hinges, function(hinge){
        hinge.setStatic(true);
    });
    this._fitness = fitness;
};

Walker.prototype._finished = function(distance, speed){
    if (globals.appState.get("fitnessQuantity") == "distance") this.setFitness(Math.abs(distance)/10.0);
    else {
        var fitness = Math.abs(speed)-35;
        if (fitness < 1) fitness = 1;
        this.setFitness(fitness);
    }
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
};




//Draw

Walker.prototype.render = function(angle, tickNum, renderThreeJS){
    if (!this._isFinished){
        if (Math.abs(this._walkerBody.body.angle)>0.5){//check for rolling
            this._isFinished = true;
            this._fitness = 0;
            return;
        }
//        if (tickNum > 1) return;
        this.drive(angle);
        if (renderThreeJS){
            _.each(this._hinges, function(hinge){
                hinge.physicsRender();
            });
            _.each( this._links, function(link){
                link.render();
            });
            _.each( this._walkerBodyConstraints, function(link){
                link.render();
            });
        }
        var totalNumTicks = globals.appState.get("numEvalTicks");
        if (tickNum == totalNumTicks-2*globals.appState.get("numPositionSteps")) this._speedMark = this._hinges[0].getCurrentPosition().x;
        if (tickNum >= totalNumTicks) {
            var position = this._hinges[0].getCurrentPosition().x;
            this._finished(position, position-this._speedMark);
        }
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
    if (this._walkerBody) {
        _.each(this._walkerBody.constraints, function(constraint){
            globals.physics.worldRemove(constraint);
            constraint = null;
        });
        this._walkerBody.constraints = null;
        globals.physics.worldRemove(this._walkerBody.body);
        this._walkerBody.body = null;
    }
    this._walkerBody = null;
    Linkage.prototype.destroy.call(this);
};



//Utilities

Walker.prototype.toJSON = function(){
    return JSON.parse(JSON.stringify(this._json));//deep copy of json
};

Walker.prototype.clone = function(json){
    if (json === undefined) json = this.toJSON();
    return new Linkage(json);
};
