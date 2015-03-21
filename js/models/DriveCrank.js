/**
 * Created by fab on 3/21/15.
 */

function DriveCrank(centerHinge, outsideHinge, link){
    this.body = this._buildBody(centerHinge, link);
    this.constraints = this._buildConstraints(this.body, centerHinge, outsideHinge);
}

DriveCrank.prototype._buildBody = function(centerHinge, link){
    return globals.physics.makeDriveCrankBody(centerHinge.getPosition(), link.getLength());
};

DriveCrank.prototype._buildConstraints = function(body, centerHinge, outsideHinge){
    centerHinge.setStatic(true);
    var constraints = [];
    constraints.push(globals.physics.makeConstraint(body, centerHinge.body, 0));//pin center of drive crank to center hinge
    constraints.push(globals.physics.makeConstraint(body, outsideHinge.body, 0,
        this._diff(outsideHinge.getPosition(), centerHinge.getPosition())));//pin outside hinge to outside of driveCrank
    return constraints;
};

DriveCrank.prototype._diff = function(position1, position2){
    var diff = {};
    _.each(_.keys(position1), function(key){
        diff[key] = position1[key] - position2[key];
    });
    return diff;
};

DriveCrank.prototype.rotate = function(thetaStep){
    globals.physics.rotate(this.body, thetaStep);
};

DriveCrank.prototype.destroy = function(){//deallocate everything
    _.each(this.constraints, function(constraint){
        globals.worldRemove(constraint);
        constraint = null;
    });
    this.constraints = null;
    globals.worldRemove(this.body);
    this.body = null;
};

DriveCrank.prototype.toJSON = function(){
    return {};
};