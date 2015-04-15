/**
 * Created by fab on 3/21/15.
 */


function Linkage(json){//init a linkage with optional json

    this.setHingesLinksCrank();//set all properties to []
    this._fitness = null;
    if (json === undefined) return;

    var self = this;
    _.each(json.hinges, function(hinge){//{position:this._position, static:this._static}
        var newHinge = self.addHingeAtPosition(hinge.position);
        if (hinge.static) newHinge.setStatic(true);
    });
    _.each(json.links, function(link){//{hinges: [this.getHingeAId(), this.getHingeBId()], length: this._length}
        self.link(self._hinges[link.hinges[0]], self._hinges[link.hinges[1]], link.length);
    });
    //{centerHinge: this.getCenterHingeId(), outsideHinge: this.getOutsideHingeId(), length: this._length}
    this.addDriveCrank(this._hinges[json.driveCrank.centerHinge], this._hinges[json.driveCrank.outsideHinge], json.driveCrank.length);
}

Linkage.prototype.setHingesLinksCrank = function(hinges, links, driveCrank, okToPassRefs){//used for clone operation

    if (hinges === undefined && links === undefined && driveCrank === undefined) okToPassRefs = true;

    if (hinges === undefined) hinges = [];
    if (links === undefined) links = [];
    if (driveCrank === undefined) driveCrank = null;

    if (okToPassRefs){
        this._hinges = hinges;
        this._links = links;
        this._driveCrank = driveCrank;
        return;
    }

    //be sure to clone everything that's passed in to remove references
    var self = this;
    this._hinges = [];
    _.each(hinges, function(hinge){
        self._hinges.push(hinge.clone(self));
    });
    this._links = [];
    _.each(links, function(link){
        self._links.push(link.clone(self._hinges[link.getHingeAId()], self._hinges[link.getHingeBId()]));
    });
    if (driveCrank) this._driveCrank = driveCrank.clone(
        self._hinges[driveCrank.getCenterHingeId()],
        self._hinges[driveCrank.getOutsideHingeId()]
    );
};




//Construct

Linkage.prototype.addHingeAtPosition = function(position){
    var hinge = new Hinge(position, this);
    this._hinges.push(hinge);
    return hinge;
};

Linkage.prototype.addDriveCrank = function(centerHinge, outsideHinge, length){
    if (!centerHinge || !outsideHinge || !length) return console.warn("drive crank parameter is missing");
    var driveCrank = new DriveCrank(centerHinge, outsideHinge, length);
    this._driveCrank = driveCrank;
    return driveCrank;
};

Linkage.prototype.link = function(hingeA, hingeB, distance){
    var link = new Link(hingeA, hingeB, distance);
    this._links.push(link);
    return link;
};



//Mating

Linkage.prototype.hillClimb = function(mutationRate){//todo we should add simulated annealing ot this as well
    return this._clone()._mutate(mutationRate);
};

Linkage.prototype.mate = function(mate, mutationRate){
    return this._clone(this._crossoverLinks(mate))._mutate(mutationRate);//child is a clone of parent1, with links crossed with parent2
};

Linkage.prototype._crossoverLinks = function(mate){//be careful here, crossed links array references parent links
    //cross link arrays, here's one way to do it, there may be others to explore
    var crossoverIndex = Math.floor(Math.random()*(this._links.length+1));
    var crossedLinks = [];
    for (var i=0;i<this._links.length;i++){
        if (i<crossoverIndex) crossedLinks.push(this._links[i]);
        else crossedLinks.push(mate.getLinkAtIndex(i));
    }
    return crossedLinks;
};

Linkage.prototype.getLinkAtIndex = function(index){
    return this._links[index];
};




//Mutation

Linkage.prototype._mutate = function(mutationRate){
    _.each(this._links, function(link){
        if (Math.random()<mutationRate){
            var linkLength = link.getLength();
            linkLength += (Math.random()*2-1)*linkLength*0.25;//mutate linkLength
            var minLength = globals.appState.get("minLinkLength");
            if (linkLength<minLength) linkLength = minLength;
            link.setLength(linkLength);
        }
    });
    return this;
};




//Fitness

Linkage.prototype.getFitness = function(){
    if (!this._fitness) this._fitness = this._calcFitness();
    return this._fitness;
};

Linkage.prototype._calcFitness = function(){
    return 4;//todo actually calc fitness here
};

Linkage.prototype.getTrajectory = function(){//trajectory of the linkage as an 2xn array
    return [[null, null]];
};




//Draw

Linkage.prototype.setWidth = function(width){
    this._iterateAllHingesAndLinks(function(object){
        object.setWidth(width);
    });
};

Linkage.prototype.setDepth = function(depth){
    this._iterateAllHingesAndLinks(function(object){
        object.setDepth(depth);
    });
};

Linkage.prototype.drive = function(){
    if (this._driveCrank) this._driveCrank.rotate(globals.appState.get("thetaStep"));
};

Linkage.prototype.render = function(screenCoordinates){//called from render loop in threeView
    this.drive();
    this._iterateAllHingesAndLinks(function(object){
        object.render(screenCoordinates);
    });
};




//Deallocate

Linkage.prototype.destroy = function(){
    this._iterateAllHingesAndLinks(function(object){
        object.destroy();
    });
    this._hinges = [];
    this._links = [];
    if (this._driveCrank) this._driveCrank.destroy();
    this._driveCrank = null;
    this._fitness = null;
};




//Utilities

Linkage.prototype._iterateAllHingesAndLinks = function(callback){
    _.each(this._hinges, function (hinge) {
        callback(hinge);
    });
    _.each(this._links, function (link) {
        callback(link);
    });
};

Linkage.prototype.toJSON = function(){
    return {
        hinges: this._hinges,
        links: this._links,
        driveCrank: this._driveCrank.toJSON()
    }
};

Linkage.prototype.getHingeId = function(hinge){//used for saving
    var index = this._hinges.indexOf(hinge);
    if (index < 0) console.warn("hinge could not be found in this linkage");
    return index;
};

Linkage.prototype._clone = function(links){
    if (links === undefined) links = this._links;
    var linkage = new Linkage();
    linkage.setHingesLinksCrank(this._hinges, links, this._driveCrank);
    return linkage;
};
