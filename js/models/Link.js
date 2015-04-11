/**
 * Created by fab on 3/21/15.
 */


var linkGeometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshNormalMaterial();

function Link(hingeA, hingeB, length){//optional parameter "length" sets distance constraint,
// otherwise calculated from initial positions of hinges
    this._hingeA = hingeA;
    this._hingeB = hingeB;

    if (length === undefined) length = this._dist(hingeA.getPosition(), hingeB.getPosition());
    else this._length = length;//save special length param for save file, otherwise it can be recalculated
    this._constraint = this._buildConstraint(hingeA, hingeB, length);

    this._mesh = this._buildMesh(length);
    this.setWidth(globals.appState.get("linkWidth"));
    this.setDepth(globals.appState.getDepth());
    globals.three.sceneAdd(this._mesh);
}



//Physics

Link.prototype._buildConstraint = function(hingeA, hingeB, length){//links create a distance constraint between hinges
    return globals.physics.makeConstraint(hingeA.getBody(), hingeB.getBody(), length);
};

Link.prototype.getLength = function(){
    return this._constraint.length;
};




//Draw

Link.prototype._buildMesh = function(length){
    var mesh = new THREE.Mesh(linkGeometry, material);
    mesh.scale.y = length;
    return mesh;
};

Link.prototype.setWidth = function(width){
    this._mesh.scale.x = width;
};

Link.prototype.setDepth = function(depth){
    this._mesh.scale.z = depth;
};

Link.prototype.render = function(){
    var hingeAPos = this._hingeA.getCurrentPosition();
    var hingeBPos = this._hingeB.getCurrentPosition();

    //get center of mass position
    var centerPos = this._avg(hingeAPos, hingeBPos);
    this._mesh.position.set(centerPos.x, centerPos.y, 0);

    //get rotation of link - negative y comes from canvas using neg y for rendering (i think)
    this._mesh.rotation.z = Math.atan2(hingeAPos.x-hingeBPos.x, -(hingeAPos.y-hingeBPos.y));
};




//deallocate

Link.prototype.destroy = function(){//deallocate everything
    this._hingeA = null;
    this._hingeB = null;
    globals.physics.worldRemove(this._constraint);
    this._constraint = null;
    globals.three.sceneRemove(this._mesh);
    this._mesh = null;
    this._length = null;
};



//Utilities

Link.prototype.toJSON = function(){
    return {
        hinges: [this.getHingeAId(), this.getHingeBId()],
        length: this._length
    };
};

Link.prototype.getHingeAId = function(){
    return this._hingeA.getId();
};

Link.prototype.getHingeBId = function(){
    return this._hingeB.getId();
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

Link.prototype._clone = function(hingeA, hingeB){
    return new Link(hingeA, hingeB, this._length);
};