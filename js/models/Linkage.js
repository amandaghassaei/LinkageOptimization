/**
 * Created by fab on 3/21/15.
 */

var targetTrajectoryMaterial = new THREE.LineBasicMaterial({
	color: 0x0000ff,
    linewidth: 3
});


function Linkage(json){//init a linkage with optional json

    this._hinges = [];
    this._links = [];
    this._driveCrank = null;
    this._fitness = null;
    this._outputContinuity = false;
    this._targetPath = null;
    this._material = new THREE.MeshBasicMaterial({color:0xffffff});
    if (json === undefined) return;

    var self = this;
    _.each(json.hinges, function(hinge){//{position:this._position, static:this._static}
        var newHinge = self.addHingeAtPosition(hinge.position);
        if (hinge.static) newHinge.setStatic(true);
    });
    _.each(json.links, function(link){//{hinges: [this.getHingeAId(), this.getHingeBId()], length: this._length}
        self.link(self._hinges[link.hinges[0]], self._hinges[link.hinges[1]], link.length);
    });
    //{centerHinge: this.getCenterHingeId(), outsideHinge: this.getOutsideHingeId(), length: this._length}
    this.addDriveCrank(this._hinges[json.driveCrank.centerHinge], this._hinges[json.driveCrank.outsideHinge], json.driveCrank.length);
}




//Construct

Linkage.prototype.addHingeAtPosition = function(position){
    var hinge = new Hinge(position, this, this._material);
    this._hinges.push(hinge);
    return hinge;
};

Linkage.prototype.addDriveCrank = function(centerHinge, outsideHinge, length){
    if (!centerHinge || !outsideHinge || !length) return console.warn("drive crank parameter is missing");
    var driveCrank = new DriveCrank(centerHinge, outsideHinge, length);
    centerHinge.setStatic(true);
    this._driveCrank = driveCrank;
    return driveCrank;
};

Linkage.prototype.link = function(hingeA, hingeB, distance){
    var link = new Link(hingeA, hingeB, this._material, distance);
    this._links.push(link);
    return link;
};




//Mating

Linkage.prototype.hillClimb = function(mutationRate){//todo we should add simulated annealing to this as well
    return this.forceMutate(mutationRate)
};

Linkage.prototype.mate = function(mate, mutationRate){
    var mateJSON = mate.toJSON();
    var json = this.toJSON();
    json.links = this._crossoverLinks(json.links, mateJSON.links);
    return this.clone(this._mutate(json, mutationRate));//child is a clone of parent1, with links crossed with parent2
};

Linkage.prototype._crossoverLinks = function(links1JSON, links2JSON){
    if (links1JSON[0].mesh || links2JSON[0].mesh) console.warn("object literals being passed");
    //cross link arrays, here's one way to do it, there may be others to explore
    var crossoverIndex = Math.floor(Math.random()*(links1JSON.length+1));
    var crossedLinks = [];
    for (var i=0;i<links1JSON.length;i++){
        if (i<crossoverIndex) crossedLinks.push(links1JSON[i]);
        else crossedLinks.push(links2JSON[i]);
    }
    return crossedLinks;
};





//Mutation

Linkage.prototype._mutate = function(json, mutationRate, forceMutate){
    var mutationOccurred = false;
    var self = this;
    _.each(json.links, function(link){
        if (Math.random()<mutationRate/100.0){
            self._mutateLink(link);
            mutationOccurred = true;
        }
    });
    if (forceMutate && !mutationOccurred) {
        this._mutateLink(json.links[Math.floor(Math.random()*json.links.length)]);
    }
    return json;
};

Linkage.prototype._mutateLink = function(link){
    link.length += (Math.random()*2-1)*link.length*0.25;//mutate linkLength
    var minLength = globals.appState.get("minLinkLength");
    if (link.length < minLength) link.length = minLength;
    return link;
};

Linkage.prototype.mutate = function(mutationRate){
    if (mutationRate === undefined) mutationRate = globals.appState.get("mutationRate");
    return this.clone(this._mutate(this.toJSON(), mutationRate))
};

Linkage.prototype.forceMutate = function(mutationRate){//used for hill climbing
    return this.clone(this._mutate(this.toJSON(), mutationRate, true))
};




//Fitness

Linkage.prototype.normalizeTrajectory = function(traj, params) {
    // adjust trajory itself
    // return set of points adjusted for midpoint, angle, radius
}

Linkage.prototype._checkWeirdness = function() {
    return !this._outputContinuity;
};

Linkage.prototype.getFitness = function(){
    // return 4;
    if (!this._fitness) {
        var hingeIndex = globals.appState.get("outputHingeIndex");
        this._fitness = this._calcFitness(globals.targetCurve, this.getTrajectory(hingeIndex));
    }
    return this._fitness;
};

Linkage.prototype.getTranslationScaleRotation = function(traj) {
    var farthest = this._getFarthest(traj);
    var distance = this._calcDistance(farthest[0], farthest[1]);
    return {
        midpoint: this._calcMidpoint(farthest),
        angle: this._calcAngle(farthest[0], farthest[1]),
        radius: distance
    };//, scale:scale, rotation:rotation};
};


Linkage.prototype._calcFarthest = function(points) {
    // find the two farthest points from each other
    var longest_distance = 0.0;
    var farthest = [];
    for (var i=0; i<points.length; i++) {
        for (var j=i+1; j<points.length; j++) {
            var distance = this._calcDistance(points[i], points[j]);
            if (distance > longest_distance) {
                farthest = [points[i], points[j]];
            }
        }
    }
    return farthest;
};

Linkage.prototype._calcMidpoint = function(points) {

    // console.log(points);

    // calculated the midpoint of a set of points
    // TODO: WHY IS THIS SO INEFFICIENT
    var x_sum = 0.0;
    var y_sum = 0.0;
    for (var i=0; i<points.length; i++) {
        // console.log(points);
        x_sum += points[i].x;
        y_sum += points[i].y;
    }
    // console.log(x_sum,y_sum);
    return {x:x_sum/points.length, y:y_sum/points.length};

};

Linkage.prototype._calcAngle = function(a, b) {
    return Math.atan2(Math.abs(a.x-b.x), Math.abs(a.y-b.y));
    // return {x_dist: points[0].x-points[1].x}
}

Linkage.prototype._calcRadius = function(midpoint, points) {

    // var rad_sum = points.reduce(function(a, b) {
    //     return this._calcDistance(a, midpoint) + this._calcDistance
    //     return this._calcDistance(a, midpoint) + this._calcDistance(b, midpoint);
    // });
    var rad_sum = 0.0;
    for (var i=0; i<points.length; i++) {
        rad_sum += this._calcDistance(points[i], midpoint);
    }
    return rad_sum/points.length;
}

Linkage.prototype._shiftMidpoint = function(midpoint, radius, target) {
    // move the midpoint of the target curve to the midpoint of the test curves
    // return a set of point of the shifted curve

//    console.log(midpoint, radius, target);

    var shifted_target = [];
    for (var i=0; i<target.length; i++) {
        var radius_ratio = radius / this._calcDistance(target[i], midpoint);
        shifted_target[i] = {x: target[i].x*radius_ratio+midpoint.x, y: target[i].y*radius_ratio+midpoint.y};
    }
    return shifted_target;
};

Linkage.prototype._calcFitness = function(target, test){

    // console.log('getting fitness');

    if (this._checkWeirdness()) {
        console.log('weird');
        return 100;
    }

    var midpoint = this._calcMidpoint(test);
    var radius = this._calcRadius(midpoint, test);
    var shifted_target = this._shiftMidpoint(midpoint, radius, target);

    // TODO: redisplay the target curve with the shifted midpoint??
    // this.drawTargetPath(shifted_target, true);


    var distances = [];

    // for each of the points in the proposed solution
    for (i=0; i<test.length; i++) {

        var min_distance = Infinity;

        // find the shortest distance to the other points
        for (j=0; j<shifted_target.length; j++) {
            var calc_distance = this._calcDistance(test[i], shifted_target[j]);
            if (calc_distance < min_distance) {
                min_distance = calc_distance;
            }
        }

        // store this distance
        distances[i] = min_distance;
        
    }
//    console.log(distances);

    if (distances.length > 0) {
        var dist_sum = distances.reduce(function(a, b) {
          return a + b;
        });
//        console.log(dist_sum);
        return radius - dist_sum / shifted_target.lengthra;
    }
    else {
        console.log('empty');
        return 100;
    }

    // return the sum of the shortest distances
    

};

Linkage.prototype._calcDistance = function(a,b) {

    // currently just use euclidean distance
    return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));
};

Linkage.prototype.getTrajectory = function(hingeIndex){//trajectory of the linkage as an 2xn array
    return this._hinges[hingeIndex].getTrackedPositions();
};

Linkage.prototype.drawTrajectories = function(visibility){
    var self = this;
    _.each(this._hinges, function(hinge){
        hinge.drawTrajectory(self._drawOffset, visibility);
    });
};

Linkage.prototype.checkContinuity = function(outputIndex){
    var path = this._hinges[outputIndex].getTrackedPositions();
    this._outputContinuity =  this._calcDistance(path[0], path[path.length-1]) < 10;
    if (!this._outputContinuity) this.setColor(0xff0000);
};




//Trajectories

Linkage.prototype.drawTargetPath = function(path, offsets, visibility){
    if (this._targetPath) this._removeTargetPath();
    var offset = this._drawOffset;
    var geometry = new THREE.Geometry();
    if (offsets.scale) console.log("add scale in target rendering");
    if (offsets.rotation) console.log("add rotation in target rendering");
    _.each(path, function(position){
        geometry.vertices.push(new THREE.Vector3(position.x+offset.x+offsets.translation.x,
            position.y+offset.y+offsets.translation.y, 0));
    });
    geometry.vertices.push(_.clone(geometry.vertices[0]));//close loop
    this._targetPath = new THREE.Line(geometry, targetTrajectoryMaterial);
    this.setTargetPathVisibility(visibility);
    globals.three.sceneAdd(this._targetPath);
};

Linkage.prototype._removeTargetPath = function(){
    globals.three.sceneRemove(this._targetPath);
    this._targetPath = null;
};

Linkage.prototype.setTargetPathVisibility = function(visibility){
    if (this._targetPath) this._targetPath.visible = visibility;
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

Linkage.prototype.drive = function(angle){
    if (this._driveCrank) this._driveCrank.rotate(angle);
};

Linkage.prototype.render = function(angle, precompute){
    var self = this;
    if (precompute){
        this.drive(angle);
        _.each(this._hinges, function(hinge){
            hinge.render(self._drawOffset, true);
        });
        return;
    }
    this._iterateAllHingesAndLinks(function(object){
        object.render(self._drawOffset, false, angle);
    });
};

Linkage.prototype.setDrawOffset = function(offset){//called from render loop in threeView
    this._drawOffset = offset;
};

Linkage.prototype.setHingePathVisibility = function(visibility, index){
    if (index !== undefined){
        this._hinges[index].setTrajectoryVisibility(visibility);
        return;
    }
    _.each(this._hinges, function(hinge){
        hinge.setTrajectoryVisibility(visibility);
    });
};

Linkage.prototype.setColor = function(color){
    this._material.color.setHex(color);
};

Linkage.prototype.relaxHingePositions = function(){
    _.each(this._hinges, function(hinge){
        hinge.relaxPosition();
    });
};



//Deallocate

Linkage.prototype.destroy = function(){
    this._iterateAllHingesAndLinks(function(object){
        object.destroy();
    });
    this._hinges = null;
    this._links = null;
    if (this._driveCrank) this._driveCrank.destroy();
    this._driveCrank = null;
    this._fitness = null;
    this._drawOffset = null;
    if (this._targetPath) this._removeTargetPath();
    this._material = null;
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

Linkage.prototype.toJSON = function(){
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

Linkage.prototype.getHingeId = function(hinge){//used for saving
    var index = this._hinges.indexOf(hinge);
    if (index < 0) console.warn("hinge could not be found in this linkage");
    return index;
};

Linkage.prototype.clone = function(json){
    if (json === undefined) json = this.toJSON();
    return new Linkage(json);
};
