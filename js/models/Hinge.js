/**
 * Created by fab on 3/21/15.
 */

var hingeGeometry = new THREE.CylinderGeometry(1,1,1,20,20);
hingeGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));

var trajectoryMaterial = new THREE.LineBasicMaterial({
	color: 0x000000,
    linewidth: 3
});

function Hinge(position, parentLinkage, material){
    if (parentLinkage === undefined) console.warn("no parent linkage supplied for hinge");
    this._parentLinkage = parentLinkage;
    //todo update this._position from physics after motion settles
    this._position = position;
    this._static = false;
    var width = globals.appState.get("linkWidth");
    this._body = this._buildBody(position, width/2);
    this._trackedPositions = [];//holds the position of this hinge for n times steps of a cycle, wait until initial perturbations from changing link lengths die off

    this._mesh = this._buildMesh(material);
    this.setWidth(width);
    this.setDepth(globals.appState.getDepth());
    globals.three.sceneAdd(this._mesh);
}




//Motion Tracking

Hinge.prototype.trackPosition = function(){
    this._trackedPositions.push(this.getCurrentPosition());
    if (this._trackedPositions.length > globals.appState.get("numPositionSteps")) console.warn("too many positions stored for hinge");
};

Hinge.prototype.getTrackedPositions = function(){
    var positions = [];
    _.each(this._trackedPositions, function(position){
        positions.push(_.clone(position));
    });
    return positions;
};

Hinge.prototype.drawTrajectory = function(offset, visibility){
    if (this._trajectory) {
        console.warn("already drew trajectory");
        globals.three.sceneRemove(this._trajectory);
    }
    var geometry = new THREE.Geometry();
    _.each(this._trackedPositions, function(position){
        geometry.vertices.push(new THREE.Vector3(position.x+offset.x, position.y+offset.y, 0));
    });
    geometry.vertices.push(_.clone(geometry.vertices[0]));//close loop
    this._trajectory = new THREE.Line(geometry, trajectoryMaterial);
    this.setTrajectoryVisibility(visibility);
    globals.three.sceneAdd(this._trajectory);
};

Hinge.prototype.setTrajectoryVisibility = function(state){
    if (this._trajectory) this._trajectory.visible = state;
};




//Physics

Hinge.prototype._buildBody = function(position, radius){//hinge owns a rigid body in matter.js
    return globals.physics.makeHingeBody(position, radius);
};

Hinge.prototype.getBody = function(){
    return this._body;
};

Hinge.prototype.setStatic = function(isStatic){//body cannot move
    globals.physics.setStatic(this._body, isStatic);
    this._static = true;
    return this;
};

Hinge.prototype.relaxPosition = function(){
    this._position = this.getCurrentPosition();
};




//Draw

Hinge.prototype._buildMesh = function(material){
    return new THREE.Mesh(hingeGeometry, material);
};

Hinge.prototype.setWidth = function(width){
    globals.physics.scaleBody(this._body, width/2);
    this._mesh.scale.x = width/2;//we are really setting rad here - divide by two
    this._mesh.scale.y = width/2;
};

Hinge.prototype.setDepth = function(depth){
    this._mesh.scale.z = depth;
};

Hinge.prototype.getCurrentPosition = function(index){//position from animation loop
    if (index) return this._trackedPositions[index];
    return _.clone(this._body.position);
};

Hinge.prototype.getPosition = function(){//position from definition (not including draw offset)
    return _.clone(this._position);
};

Hinge.prototype.render = function(screenCoordinates, precompute, index){
    if (!precompute) {
        var position = this._trackedPositions[index];
        this._mesh.position.set(position.x+screenCoordinates.x, position.y+screenCoordinates.y, 0);
    }
    if (globals.population.shouldStorePosition()) this.trackPosition();
};

Hinge.prototype.physicsRender = function(screenCoordinates){//always uses physics engine to get position
    var position = this._body.position;//get position from body and update mesh
    this._mesh.position.set(position.x+screenCoordinates.x, position.y+screenCoordinates.y, 0);
};




//Deallocate

Hinge.prototype.destroy = function(){
    //todo send message to link saying it is no longer valid?
    this._position = null;
    globals.physics.worldRemove(this._body);
    this._body = null;
    globals.three.sceneRemove(this._mesh);
    this._mesh = null;
    globals.three.sceneRemove(this._trajectory);
    this._trajectory = null;
    _.each(this._trackedPositions, function(position){
        position = null;
    });
    this._trackedPositions = null;
    this._parentLinkage = null;
};




//Utilities

Hinge.prototype.toJSON = function(){//todo position should be recalc-ed based on stable state
    return {position: _.clone(this._position), static:this._static};
};

Hinge.prototype.getId = function(){//position of this instance in the hinges array on the parent linkage
    return this._parentLinkage.getHingeId(this);
};