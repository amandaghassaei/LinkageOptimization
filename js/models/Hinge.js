/**
 * Created by fab on 3/21/15.
 */

var hingeGeometry = new THREE.CylinderGeometry(1,1,1,20,20);
hingeGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
var material = new THREE.MeshNormalMaterial();

function Hinge(position, rad, depth){
    this.initialPos = position;//draw at this position when paused
    this.body = this._buildBody(position);
    this.mesh = this._buildMesh(rad, depth);
    globals.three.sceneAdd(this.mesh);
}

Hinge.prototype._buildBody = function(position){//hinge owns a rigid body in matter.js
    return globals.physics.makeHingeBody(position);
};

Hinge.prototype.setStatic = function(isStatic){//body cannot move
    globals.physics.setStatic(this.body, isStatic);
};

Hinge.prototype._buildMesh = function(rad, depth){
    var mesh = new THREE.Mesh(hingeGeometry, material);
    mesh.scale.x = rad;
    mesh.scale.y = rad;
    mesh.scale.z = depth;
    return mesh;
};

Hinge.prototype.currentPosition = function(){
    return _.clone(this.body.position);
};

Hinge.prototype.position = function(){
    return _.clone(this.initialPos);
};

Hinge.prototype.render = function(){
    var position = this.body.position;//get position from body and update mesh
    this.mesh.position.set(position.x, position.y, 0);
};

Hinge.prototype.destroy = function(){
    this.initialPos = null;
    globals.three.sceneRemove(this.mesh);
    this.mesh = null;
};

Hinge.prototype.toJSON = function(){
    return {position:this.initialPos};
};