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
    if (json === undefined) {
        console.warn("inited with no json");
        return;
    }

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
    return this.mutate(mutationRate)
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

Linkage.prototype._mutate = function(json, mutationRate){
    _.each(json.links, function(link){
        if (Math.random()<mutationRate/100.0){
            link.length += (Math.random()*2-1)*link.length*0.25;//mutate linkLength
            var minLength = globals.appState.get("minLinkLength");
            if (link.length < minLength) link.length = minLength;
        }
    });
    return json;
};

Linkage.prototype.mutate = function(mutationRate){
    if (mutationRate === undefined) mutationRate = globals.appState.get("mutationRate");
    return this.clone(this._mutate(this.toJSON(), mutationRate))
};




//Fitness

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

Linkage.prototype.getShiftedTarget = function() {
    var hingeIndex = globals.appState.get("outputHingeIndex");
    var traj = this.getTrajectory(hingeIndex);
    // console.log(hingeIndex, derp);
    // TODO: this trajectory seems to be empty
    var midpoint = this._calcMidpoint(traj);
    // console.log(midpoint);
    return this._shiftMidpoint(midpoint, globals.targetCurve);
}

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

    console.log(midpoint, radius, target);

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
    console.log(distances);

    if (distances.length > 0) {
        var dist_sum = distances.reduce(function(a, b) {
          return a + b;
        });
        console.log(dist_sum);
        return dist_sum;
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

Linkage.prototype.render = function(angle){//called from render loop in threeView
    this.drive(angle);
    var self = this;
    this._iterateAllHingesAndLinks(function(object){
        object.render(self._drawOffset);
    });
};

Linkage.prototype.setDrawOffset = function(offset){//called from render loop in threeView
    this._drawOffset = offset;
};

Linkage.prototype.setHingePathVisibility = function(visibility, index){
    if (index){
        this._hinges[index].setTrajectoryVisibility(visibility);
        return;
    }
    _.each(this._hinges, function(hinge){
        hinge.setTrajectoryVisibility(visibility);
    });
};

Linkage.prototype.drawTargetPath = function(path, visibility){
    var offset = this._drawOffset;
    if (this._targetPath) globals.three.sceneRemove(this._targetPath);
    var geometry = new THREE.Geometry();
    _.each(path, function(position){
        geometry.vertices.push(new THREE.Vector3(position.x+offset.x, position.y+offset.y, 0));
    });
    geometry.vertices.push(_.clone(geometry.vertices[0]));//close loop
    this._targetPath = new THREE.Line(geometry, targetTrajectoryMaterial);
    this.setTargetPathVisibility(visibility);
    globals.three.sceneAdd(this._targetPath);
};

Linkage.prototype.setTargetPathVisibility = function(visibility){
    if (this._targetPath) this._targetPath.visible = visibility;
};

Linkage.prototype.setColor = function(color){
    this._material.color.setHex(color);
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
    this._drawOffset = null;
    if (this._targetPath) globals.three.sceneRemove(this._targetPath);
    this._targetPath = null;
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
