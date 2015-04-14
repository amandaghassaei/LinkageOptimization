/**
 * Created by fab on 3/21/15.
 */

var hingeGeometry = new THREE.CylinderGeometry(1,1,1,20,20);
hingeGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
var hingeMaterial = new THREE.MeshNormalMaterial();

function Hinge(position, parentLinkage){
    if (parentLinkage === undefined) console.warn("no parent linkage supplied for hinge");
    this._parentLinkage = parentLinkage;
    //todo update this._position from physics after motion settles
    this._position = position;//draw at this position when paused
    this._body = this._buildBody(position);

    this._mesh = this._buildMesh();
    this.setWidth(globals.appState.get("linkWidth"));
    this.setDepth(globals.appState.getDepth());
    globals.three.sceneAdd(this._mesh);
}




//Physics

Hinge.prototype._buildBody = function(position){//hinge owns a rigid body in matter.js
    return globals.physics.makeHingeBody(position);
};

Hinge.prototype.getBody = function(){
    return this._body;
};

Hinge.prototype.setStatic = function(isStatic){//body cannot move
    globals.physics.setStatic(this._body, isStatic);
    return this;
};




//Draw

Hinge.prototype._buildMesh = function(){
    return new THREE.Mesh(hingeGeometry, hingeMaterial);
};

Hinge.prototype.setWidth = function(width){
    this._mesh.scale.x = width/2;//we are really setting rad here - divide by two
    this._mesh.scale.y = width/2;
};

Hinge.prototype.setDepth = function(depth){
    this._mesh.scale.z = depth;
};

Hinge.prototype.getCurrentPosition = function(){//position from animation loop
    return _.clone(this._body.position);
};

Hinge.prototype.getPosition = function(){//position from definition
    return _.clone(this._position);
};

Hinge.prototype.render = function(){
    var position = this._body.position;//get position from body and update mesh
    this._mesh.position.set(position.x, position.y, 0);
};




//Deallocate

Hinge.prototype.destroy = function(){
    //todo send message to link saying it is no longer valid
    this._position = null;
    globals.physics.worldRemove(this._body);
    this._body = null;
    globals.three.sceneRemove(this._mesh);
    this._mesh = null;
    this._parentLinkage = null;
};




//Utilities

Hinge.prototype.toJSON = function(){
    return {position:this._position};
};

Hinge.prototype.getId = function(){//position of this instance in the hinges array on the parent linkage
    return this._parentLinkage.getHingeId(this);
};

Hinge.prototype.clone = function(parentLinkage){
    return new Hinge(_.clone(this._position), parentLinkage);
};