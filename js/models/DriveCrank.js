/**
 * Created by fab on 3/21/15.
 */

function DriveCrank(centerHinge, outsideHinge, link){
    this._centerHinge = centerHinge;
    this._outsideHinge = outsideHinge;
    this._link = link;
    this._body = this._buildBody(centerHinge, link);
    this._constraints = this._buildConstraints(this._body, centerHinge, outsideHinge);
}



//Physics

DriveCrank.prototype._buildBody = function(centerHinge, link){
    return globals.physics.makeDriveCrankBody(centerHinge.getPosition(), link.getLength());
};

DriveCrank.prototype._buildConstraints = function(body, centerHinge, outsideHinge){
    centerHinge.setStatic(true);
    var constraints = [];
    constraints.push(globals.physics.makeConstraint(body, centerHinge.getBody(), 0));//pin center of drive crank to center hinge
    constraints.push(globals.physics.makeConstraint(body, outsideHinge.getBody(), 0,
        this._diff(outsideHinge.getPosition(), centerHinge.getPosition())));//pin outside hinge to outside of driveCrank
    return constraints;
};

DriveCrank.prototype.rotate = function(thetaStep){
    globals.physics.rotate(this._body, thetaStep);
};



//Deallocate

DriveCrank.prototype.destroy = function(){//deallocate everything
    _.each(this._constraints, function(constraint){
        globals.physics.worldRemove(constraint);
        constraint = null;
    });
    this._constraints = null;
    globals.physics.worldRemove(this._body);
    this._body = null;
    this._centerHinge = null;
    this._outsideHinge = null;
    this._link = null;
};



//Utilities

DriveCrank.prototype.toJSON = function(){
    return {
        centerHinge: this._centerHinge.getId(),
        outsideHinge: this._outsideHinge.getId(),
        length: this._link.length
    };
};

DriveCrank.prototype._diff = function(position1, position2){
    var diff = {};
    _.each(_.keys(position1), function(key){
        diff[key] = position1[key] - position2[key];
    });
    return diff;
};