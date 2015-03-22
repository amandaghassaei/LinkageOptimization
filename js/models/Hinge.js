/**
 * Created by fab on 3/21/15.
 */

var hingeGeometry = new THREE.CylinderGeometry(1,1,1,20,20);
hingeGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
var material = new THREE.MeshNormalMaterial();

function Hinge(position, width, depth){
    this.position = position;//draw at this position when paused
    this.body = this._buildBody(position);

    this.mesh = this._buildMesh();
    this.setWidth(width);
    this.setDepth(depth);
    globals.three.sceneAdd(this.mesh);
}

Hinge.prototype._buildBody = function(position){//hinge owns a rigid body in matter.js
    return globals.physics.makeHingeBody(position);
};

Hinge.prototype.setStatic = function(isStatic){//body cannot move
    globals.physics.setStatic(this.body, isStatic);
    return this;
};

Hinge.prototype._buildMesh = function(){
    return new THREE.Mesh(hingeGeometry, material);
};

Hinge.prototype.setWidth = function(width){
    this.mesh.scale.x = width/2;//we are really setting rad here - divide by two
    this.mesh.scale.y = width/2;
};

Hinge.prototype.setDepth = function(depth){
    this.mesh.scale.z = depth;
};

Hinge.prototype.currentPosition = function(){
    return _.clone(this.body.position);
};

Hinge.prototype.getPosition = function(){
    return _.clone(this.position);
};

Hinge.prototype.getId = function(){//position of this instance in the hinges array on the globals.linkage
    return globals.linkage.get("hinges").indexOf(this);
};

Hinge.prototype.render = function(){
    var position = this.body.position;//get position from body and update mesh
    this.mesh.position.set(position.x, position.y, 0);
};

Hinge.prototype.destroy = function(){
    //todo send message to link saying it is no longer valid
    this.position = null;
    globals.physics.worldRemove(this.body);
    this.body = null;
    globals.three.sceneRemove(this.mesh);
    this.mesh = null;
};

Hinge.prototype.toJSON = function(){
    return {position:this.position};
};