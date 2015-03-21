/**
 * Created by fab on 3/21/15.
 */


var linkGeometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshNormalMaterial();

function Link(hingeA, hingeB, length, width, depth){//hinges have bodies in matter.js, Links are just used for visualization
    this.hingeA = hingeA;
    this.hingeB = hingeB;
    this.mesh = this._buildMesh(hingeA, hingeB, length, width, depth);
    globals.three.sceneAdd(this.mesh);
}

Link.prototype._buildMesh = function(hingeA, hingeB, length, width, depth){
    var mesh = new THREE.Mesh(linkGeometry, material);
    length = this._dist(hingeA.position(), hingeB.position());
    mesh.scale.y = length;
    mesh.scale.x = width;
    mesh.scale.z = depth;
    return mesh;
};

Link.prototype.render = function(){
    var hingeAPos = this.hingeA.currentPosition();
    var hingeBPos = this.hingeB.currentPosition();

    //get center of mass position
    var centerPos = this._avg(hingeAPos, hingeBPos);
    this.mesh.position.set(centerPos.x, centerPos.y, 0);

    //get rotation

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

Link.prototype.destroy = function(){//deallocate everything
    this.hingeA = null;
    this.hingeB = null;
    globals.three.sceneRemove(this.mesh);
    this.mesh = null;
};

Link.prototype.toJSON = function(){
    return {};
};