/**
 * Created by fab on 3/21/15.
 */


var linkGeometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshNormalMaterial();

function Link(hingeA, hingeB, width, depth, length){//optional parameter "length" sets distance constraint,
// otherwise calculated from initial positions of hinges
    this.hingeA = hingeA;
    this.hingeB = hingeB;

    if (length === undefined) length = this._dist(hingeA.getPosition(), hingeB.getPosition());
    this.constraint = this._buildConstraint(hingeA, hingeB, length);

    this.mesh = this._buildMesh(length);
    this.setWidth(width);
    this.setDepth(depth);
    globals.three.sceneAdd(this.mesh);
}

Link.prototype._buildConstraint = function(hingeA, hingeB, length){//links create a distance constraint between hinges
    return globals.physics.makeConstraint(hingeA.body, hingeB.body, length);
};

Link.prototype._buildMesh = function(length){
    var mesh = new THREE.Mesh(linkGeometry, material);
    mesh.scale.y = length;
    return mesh;
};

Link.prototype.setWidth = function(width){
    this.mesh.scale.x = width;
};

Link.prototype.setDepth = function(depth){
    this.mesh.scale.z = depth;
};

Link.prototype.render = function(){
    var hingeAPos = this.hingeA.currentPosition();
    var hingeBPos = this.hingeB.currentPosition();

    //get center of mass position
    var centerPos = this._avg(hingeAPos, hingeBPos);
    this.mesh.position.set(centerPos.x, centerPos.y, 0);

    //get rotation of link - negative y comes from canvas using neg y for rendering (i think)
    this.mesh.rotation.z = Math.atan2(hingeAPos.x-hingeBPos.x, -(hingeAPos.y-hingeBPos.y));
};

Link.prototype._avg = function(positionA, positionB){
    var avg = {};
    _.each(_.keys(positionA), function(key){
        avg[key] = (positionA[key] + positionB[key])/2;
    });
    return avg;
};

Link.prototype._dist = function(positionA, positionB){
    //length of link = distance between hinges
    var diffSq = 0;
    _.each(_.keys(positionA), function(key){
        diffSq += Math.pow(positionA[key] - positionB[key], 2);
    });
    return Math.sqrt(diffSq);
};

Link.prototype.getLength = function(){
    return this.constraint.length;
};

Link.prototype.destroy = function(){//deallocate everything
    this.hingeA = null;
    this.hingeB = null;
    globals.physics.worldRemove(this.constraint);
    this.constraint = null;
    globals.three.sceneRemove(this.mesh);
    this.mesh = null;
};

Link.prototype.toJSON = function(){
    return {};
};