/**
 * Created by fab on 3/21/15.
 */

function DriveCrank(centerHinge, outsideHinge, link){
    //todo do we need to store all these objects?
    this.centerHinge = centerHinge;//defines the center position of the crank
    this.outsideHinge = outsideHinge;//connects the crank to the rest of the linkage
    this.link = link;//link defines the radius of the crank
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

DriveCrank.prototype.render = function(){

};

DriveCrank.prototype.destroy = function(){//deallocate everything
    _.each(this.constraints, function(constraint){
        globals.worldRemove(constraint);
        constraint = null;
    });
    this.constraints = null;
    globals.worldRemove(this.body);
    this.body = null;
    this.centerHinge = null;
    this.outsideHinge = null;
    this.link = null;
};

DriveCrank.prototype.toJSON = function(){
    return {};
};