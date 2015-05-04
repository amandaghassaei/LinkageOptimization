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
    this._material = new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(Math.random(),Math.random(),Math.random())});
    if (json === undefined) return;

    if (!(globals.appState.get("fitnessBasedOnTargetPath")) && json.angle && json.angle != 0) json = this._rotateLinkage(json, json.angle);

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

Linkage.prototype._rotateLinkage = function(json, angle){
    _.each(json.hinges, function(hinge){
        var rotation = Math.atan2(hinge.position.y, hinge.position.x) + angle;
        var dist = Math.sqrt(Math.pow(hinge.position.y, 2) + Math.pow(hinge.position.x, 2));
        hinge.position.x = Math.cos(rotation)*dist;
        hinge.position.y = Math.sin(rotation)*dist;
    });
    return json;
};

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
    if (Math.random()<mutationRate/100.0){
        json.angle = this._mutateAngle(json.angle);
        mutationOccurred = true;
    }
    if (forceMutate && !mutationOccurred) {
        if (!(globals.appState.get("fitnessBasedOnTargetPath")) && Math.random()<1/6.0){
            json.angle = this._mutateAngle(json.angle);
        } else {
            this._mutateLink(json.links[Math.floor(Math.random()*json.links.length)]);
        }
    }
    return json;
};

Linkage.prototype._mutateLink = function(link){
    link.length += (Math.random()*2-1)*link.length*0.25;//mutate linkLength
    var minLength = globals.appState.get("minLinkLength");
    if (link.length < minLength) link.length = minLength;
    return link;
};

Linkage.prototype._mutateAngle = function(angle){
    angle += (Math.random()*2-1)*0.25;//mutate angle by max 0.15 rad
    return angle;
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
    // adjust trajectory itself
    // return set of points adjusted for midpoint, angle, radius
    // console.log(params);
    // return this._shiftMidpoint(params.translation, params.scale, traj);
    return this._shiftAngle(params.rotation, this._shiftMidpoint(params.translation, params.scale, traj));
    // return this._shiftAngle(params.rotation, this._shiftMidpoint(params.translation, 1, traj));
    // return traj;
}

Linkage.prototype._checkWeirdness = function() {
    return !this._outputContinuity;
};

Linkage.prototype.getFitness = function(){
    // return 4;
    if (!this._fitness) {
        var hingeIndex = globals.appState.get("outputHingeIndex");
        var traj = this.getTrajectory(hingeIndex);
        this._fitness = this._calcFitness(globals.targetCurve, this.normalizeTrajectory(traj, this.getTranslationScaleRotation(traj)));
        // this._fitness = this._calcFitness(globals.targetCurve, this.getTrajectory(hingeIndex));
    }
    return this._fitness;
};

Linkage.prototype.getTranslationScaleRotation = function(traj) {
    var farthest = this._calcFarthest(traj);
    var distance = this._calcDistance(farthest[0], farthest[1]);
    return {
        translation: this._calcMidpoint(traj),
        rotation: this._calcAngle(farthest[0], farthest[1]),
        scale: distance
    };
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
                longest_distance = distance;
            }
        }
    }
    if (farthest[0].x < farthest[1].x) {
        var temp = farthest[0];
        farthest[0] = farthest[1];
        farthest[1] = temp;
    }
    return farthest;
};

Linkage.prototype._calcMidpoint = function(points) {
    // calculated the midpoint of a set of points
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
    // return Math.atan2(Math.abs(a.y-b.y), Math.abs(a.x-b.x));
    return Math.atan2(a.y-b.y, a.x-b.x);
    // return Math.atan2(a.x-b.x, a.y-b.y);
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

   // console.log('derp', midpoint, radius, target);

    var shifted_target = [];
    for (var i=0; i<target.length; i++) {
        var radius_ratio = radius / this._calcDistance(target[i], midpoint);
        shifted_target[i] = {
            x: (target[i].x-midpoint.x)*1/radius, 
            y: (target[i].y-midpoint.y)*1/radius
            // x: target[i].x-midpoint.x,
            // y: target[i].y-midpoint.y
        };
    }
    return shifted_target;
};

Linkage.prototype._shiftAngle = function(angle, target) {
    var shifted_target = [];
    for (var i=0; i<target.length; i++) {
        var dist = this._calcDistance(target[i], {x:0, y:0});
        var ang = this._calcAngle(target[i], {x:0, y:0}) - angle;

        shifted_target[i] = {
            x: dist * Math.cos(ang),
            y: dist * Math.sin(ang)
            // x: target[i].x, 
            // y: target[i].y+this._calcDistance(target[i], {x:0, y:0})*Math.sin(angle)
        };
    }
    return shifted_target;
};

Linkage.prototype.setFitness = function(fitness){
    this._fitness = fitness;
    this.hide();
};

Linkage.prototype._calcFitness = function(target, test){

    // console.log('getting fitness');

    if (this._checkWeirdness()) {
        console.log('weird');
        return 0;
    }

    // var midpoint = this._calcMidpoint(test);
    // var radius = this._calcRadius(midpoint, test);
    // var shifted_target = this._shiftMidpoint(midpoint, radius, target);

    // TODO: redisplay the target curve with the shifted midpoint??
    // this.drawTargetPath(shifted_target, true);


    var distances = [];

    // for each of the points in the proposed solution
    for (i=0; i<test.length; i++) {

        var min_distance = Infinity;

        // find the shortest distance to the other points
        for (j=0; j<target.length; j++) {
            var calc_distance = this._calcDistance(test[i], target[j]);
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
        // return radius - dist_sum / target.length;
        // return dist_sum;
        var fitness = 80-dist_sum*10
        if (fitness > 0) {
            return fitness;
        }
        else
            return 0;
    }
    else {
        console.log('empty');
        return 0;
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

Linkage.prototype.getTrajectories = function(){
    var trajectories = [];
    _.each(this._hinges, function(hinge){
        trajectories.push(hinge.getTrackedPositions());
    });
    return trajectories;
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
    var geometry = new THREE.Geometry();
    _.each(path, function(position){
        geometry.vertices.push(new THREE.Vector3(position.x, position.y, 0));
    });
    geometry.vertices.push(_.clone(geometry.vertices[0]));//close loop
    this._targetPath = new THREE.Line(geometry, targetTrajectoryMaterial);
    // this._targetPath.position.set(this._drawOffset.x, this._drawOffset.y, 0);
    // console.log('herp', offsets.translation);
    if (offsets.translation) this._targetPath.position.set(this._drawOffset.x+offsets.translation.x, this._drawOffset.y+offsets.translation.y, 0);
    if (offsets.scale) this._targetPath.scale.set(offsets.scale, offsets.scale, offsets.scale);
    if (offsets.rotation) this._targetPath.rotateOnAxis(new THREE.Vector3(0,0,1), offsets.rotation);
    this.setTargetPathVisibility(visibility);
    globals.three.sceneAdd(this._targetPath);

    //draw a circle at origin for sanity check
//    var geo = new THREE.CylinderGeometry(1, 1, 0.01);
//    geo.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
//    var origin = new THREE.Mesh(geo);
//    origin.position.set(this._drawOffset.x, this._drawOffset.y, 0);
//    globals.three.sceneAdd(origin);
};

Linkage.prototype._removeTargetPath = function(){
    globals.three.sceneRemove(this._targetPath);
    this._targetPath = null;
};

Linkage.prototype.setTargetPathVisibility = function(visibility){
    if (this._targetPath) this._targetPath.visible = visibility;
};




//Draw

Linkage.prototype.hide = function(){
    this._material.opacity = 0.0;
    this._material.transparent = true;
};

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
    if (this._driveCrank) {
        this._driveCrank.rotate(angle);
    }
};

Linkage.prototype.render = function(angle, precompute){
    var self = this;
    if (precompute){
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
        driveCrank: this._driveCrank.toJSON(),
        angle: 0
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
